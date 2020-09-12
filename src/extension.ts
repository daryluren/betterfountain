'use strict';
import { getFountainConfig, changeFountainUIPersistence, uiPersistence, initFountainUIPersistence } from "./configloader";
import { ExtensionContext, languages, TextDocument } from 'vscode';
import * as vscode from 'vscode';
import * as afterparser from "./afterwriting-parser";
import { GeneratePdf } from "./pdf/pdf";
import { secondsToString, numberScenes } from "./utils";
import { retrieveScreenPlayStatistics, statsAsHtml } from "./statistics";
import * as telemetry from "./telemetry";


export class FountainCommandTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		//throw new Error("Method not implemented.");
		return element;
	}
	getChildren(/*element?: vscode.TreeItem*/): vscode.ProviderResult<any[]> {
		const elements: vscode.TreeItem[] = [];
		const treeExportPdf = new vscode.TreeItem("Export PDF");
		const treeLivePreview = new vscode.TreeItem("Show live preview");
		const numberScenes = new vscode.TreeItem("Number all scenes (replaces existing scene numbers)");
		const statistics = new vscode.TreeItem("Calculate screenplay statistics");
		treeExportPdf.command = {
			command: 'fountain.exportpdf',
			title: ''
		};
		treeLivePreview.command = {
			command: 'fountain.livepreview',
			title: ''
		};
		treeLivePreview.command = {
			command: 'fountain.livepreviewstatic',
			title: ''
		};
		numberScenes.command = {
			command: 'fountain.numberScenes',
			title: ''
		}
		statistics.command = {
			command: 'fountain.statistics',
			title: ''
		};
		elements.push(treeExportPdf);
		elements.push(treeLivePreview);
		elements.push(numberScenes);
		elements.push(statistics);
		return elements;
	}
}

//hierarchyend is the last line of the token's hierarchy. Last line of document for the root, last line of current section, etc...





import { FountainFoldingRangeProvider } from "./providers/Folding";
import { FountainCompletionProvider } from "./providers/Completion";
import { FountainSymbolProvider } from "./providers/Symbols";
import { ShowDecorations, ClearDecorations } from "./providers/Decorations";

import { createPreviewPanel, previews, FountainPreviewSerializer, getPreviewsToUpdate } from "./providers/Preview";
import { FountainOutlineTreeDataProvider } from "./providers/Outline";
import { performance } from "perf_hooks";


/**
 * Approximates length of the screenplay based on the overall length of dialogue and action tokens
 */

function updateStatus(lengthAction: number, lengthDialogue: number): void {
	if (durationStatus != undefined) {

		if (activeFountainDocument() != undefined) {
			durationStatus.show();
			//lengthDialogue is in syllables, lengthAction is in characters
			var durationDialogue = lengthDialogue;
			var durationAction = lengthAction;
			durationStatus.tooltip = "Dialogue: " + secondsToString(durationDialogue) + "\nAction: " + secondsToString(durationAction);
			//durationStatus.text = "charcount: " + (lengthAction)+"c"
			durationStatus.text = secondsToString(durationDialogue + durationAction);
		}
		else {
			durationStatus.hide();
		}
	}
}

var durationStatus: vscode.StatusBarItem;
const outlineViewProvider: FountainOutlineTreeDataProvider = new FountainOutlineTreeDataProvider();
const commandViewProvider: FountainCommandTreeDataProvider = new FountainCommandTreeDataProvider();

export let diagnosticCollection = languages.createDiagnosticCollection("fountain");
export let diagnostics: vscode.Diagnostic[] = [];

//return the relevant fountain document for the currently selected preview or text editor
export function activeFountainDocument(): vscode.Uri{
	//first check if any previews have focus
	for (let i = 0; i < previews.length; i++) {
		if(previews[i].panel.active)
			return vscode.Uri.parse(previews[i].uri);
	}
	//no previews were active, is activeTextEditor a fountain document?
	if(vscode.window.activeTextEditor != undefined && vscode.window.activeTextEditor.document.languageId == "fountain"){
		return vscode.window.activeTextEditor.document.uri;
	}
	//As a last resort, check if there are any visible fountain text editors
	for (let i = 0; i < vscode.window.visibleTextEditors.length; i++) {
		if(vscode.window.visibleTextEditors[i].document.languageId == "fountain")
			return vscode.window.visibleTextEditors[i].document.uri;
	}
	//all hope is lost
	return undefined;
}

export function getEditor(uri:vscode.Uri): vscode.TextEditor{
	//search visible text editors
	for (let i = 0; i < vscode.window.visibleTextEditors.length; i++) {
		if(vscode.window.visibleTextEditors[i].document.uri.toString() == uri.toString())
			return vscode.window.visibleTextEditors[i];
	}
	//the editor was not visible,
	return undefined;
}


export function activate(context: ExtensionContext) {

	//Init telemetry
	telemetry.initTelemetry();

	//Register for outline tree view
	vscode.window.registerTreeDataProvider("fountain-outline", outlineViewProvider)
	vscode.window.createTreeView("fountain-outline", { treeDataProvider: outlineViewProvider });

	//Register command tree view
	vscode.window.registerTreeDataProvider("fountain-commands", outlineViewProvider)
	vscode.window.createTreeView("fountain-commands", { treeDataProvider: commandViewProvider });

	//Register for line duration length
	durationStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	context.subscriptions.push(durationStatus);

	//Register for live preview (dynamic)
	context.subscriptions.push(vscode.commands.registerCommand('fountain.livepreview', () => {
		// Create and show a new dynamic webview for the active text editor
		createPreviewPanel(vscode.window.activeTextEditor,true);
		telemetry.reportTelemetry("command:fountain.livepreview");
	}));
	//Register for live preview (static)
	context.subscriptions.push(vscode.commands.registerCommand('fountain.livepreviewstatic', () => {
		// Create and show a new dynamic webview for the active text editor
		createPreviewPanel(vscode.window.activeTextEditor,false);
		telemetry.reportTelemetry("command:fountain.livepreviewstatic");
	}));

	//Jump to line command
	context.subscriptions.push(vscode.commands.registerCommand('fountain.jumpto', (args) => {
		
		let editor = getEditor(activeFountainDocument());
		let range = editor.document.lineAt(Number(args)).range;
		editor.selection = new vscode.Selection(range.start, range.start);
		editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
		//If live screenplay is visible scroll to it with
		if (getFountainConfig(editor.document.uri).synchronized_markup_and_preview){
			previews.forEach(p => {
				if(p.uri == editor.document.uri.toString())
					p.panel.webview.postMessage({ command: 'scrollTo', content: args });
			});
		}
		telemetry.reportTelemetry("command:fountain.jumpto");
	}));


	context.subscriptions.push(vscode.commands.registerCommand('fountain.exportpdf', async () => {
		var canceled = false;
		if (canceled) return;
		var editor = getEditor(activeFountainDocument());
		var saveuri = vscode.Uri.file(editor.document.fileName.replace('.fountain', ''));
		var filepath = await vscode.window.showSaveDialog(
			{
				filters: { "PDF File": ["pdf"] },
				defaultUri: saveuri
			});
		if (filepath == undefined) return;

		var config = getFountainConfig(activeFountainDocument());
		telemetry.reportTelemetry("command:fountain.exportpdf");
		vscode.window.withProgress({ title: "Exporting PDF...", location: vscode.ProgressLocation.Notification }, async progress => {
			progress.report({message: "Parsing document", increment: 0});
			var parsed = afterparser.parse(editor.document.getText(), config, false);
			GeneratePdf(filepath.fsPath, config, parsed, progress);
		});
	}));
	context.subscriptions.push(vscode.commands.registerCommand('fountain.numberScenes', numberScenes));
	context.subscriptions.push(vscode.commands.registerCommand('fountain.statistics', async () => {
		const statsPanel = vscode.window.createWebviewPanel('Screenplay statistics', 'Screenplay statistics', -1)
		statsPanel.webview.html = `Calculating screenplay statistics...`
		
		var editor = getEditor(activeFountainDocument());
		var config = getFountainConfig(activeFountainDocument());
		var parsed = afterparser.parse(editor.document.getText(), config, false);

		const stats = await retrieveScreenPlayStatistics(editor.document.getText(), parsed, config)
		const statsHTML = statsAsHtml(stats)
		statsPanel.webview.html = statsHTML
		telemetry.reportTelemetry("command:fountain.statistics");
	}));

	initFountainUIPersistence(); //create the ui persistence save file
	context.subscriptions.push(vscode.commands.registerCommand('fountain.outline.togglesynopses', ()=>{
		changeFountainUIPersistence("outline_visibleSynopses", !uiPersistence.outline_visibleSynopses);
		outlineViewProvider.update();
		telemetry.reportTelemetry("command:fountain.outline.togglesynopses");
	}));

	vscode.workspace.onWillSaveTextDocument(e => {
		const config = getFountainConfig(e.document.uri);
		if (config.number_scenes_on_save === true) {
			numberScenes();
		}
	})

	vscode.commands.registerCommand('type', (args) => {

		//Automatically skip to the next line at the end of parentheticals
		if (args.text == "\n") {
			const editor = vscode.window.activeTextEditor;
			if (editor.selection.isEmpty) {
				const position = editor.selection.active;
				var linetext = editor.document.getText(new vscode.Range(new vscode.Position(position.line, 0), new vscode.Position(position.line, 256)));
				if (position.character == linetext.length - 1) {
					if (linetext.match(/^\s*\(.*\)$/g) || linetext.match(/^\s*((([A-Z0-9 ]+|@.*)(\([A-z0-9 '\-.()]+\))+|)$)/)) {
						var newpos = new vscode.Position(position.line, linetext.length);
						editor.selection = new vscode.Selection(newpos, newpos);
					}
				}
			}
		}
		vscode.commands.executeCommand('default:type', {
			text: args.text
		});
	});

	//Setup custom folding mechanism
	languages.registerFoldingRangeProvider({ scheme: 'file', language: 'fountain' }, new FountainFoldingRangeProvider());

	//Setup autocomplete
	languages.registerCompletionItemProvider({ scheme: 'file', language: 'fountain' }, new FountainCompletionProvider(), '\n', '-', ' ');

	//Setup symbols (outline)
	languages.registerDocumentSymbolProvider({ scheme: 'file', language: 'fountain' }, new FountainSymbolProvider());


	//parse the document
	if (vscode.window.activeTextEditor != undefined && vscode.window.activeTextEditor.document != undefined && vscode.window.activeTextEditor.document.languageId=="fountain")
		parseDocument(vscode.window.activeTextEditor.document);

	vscode.window.registerWebviewPanelSerializer('fountain-preview', new FountainPreviewSerializer());
}



vscode.workspace.onDidChangeTextDocument(change => {
	if (change.document.languageId=="fountain")
		parseDocument(change.document);
})


//var lastFountainDocument:TextDocument;
export var parsedDocuments = new Map<string, afterparser.parseoutput>();

export function activeParsedDocument(): afterparser.parseoutput {
	var texteditor = getEditor(activeFountainDocument());
	return parsedDocuments.get(texteditor.document.uri.toString());
}

export class FountainStructureProperties {
	scenes: { scene: number; line: number }[];
	sceneLines: number[];
	sceneNames: string[];
	titleKeys: string[];
	firstTokenLine: number;
	fontLine: number;
	lengthAction: number; //Length of the action character count
	lengthDialogue: number; //Length of the dialogue character count
	characters: Map<string, number[]>;
}

var fontTokenExisted: boolean = false;
const decortypesDialogue = vscode.window.createTextEditorDecorationType({
});

let parseTelemetryLimiter = 5;
let parseTelemetryFrequency = 5;

export function parseDocument(document: TextDocument) {
	let t0 = performance.now()

	ClearDecorations();

	var previewsToUpdate = getPreviewsToUpdate(document.uri)
	var output = afterparser.parse(document.getText(), getFountainConfig(document.uri), previewsToUpdate.length>0)

	
	if (previewsToUpdate) {
		//lastFountainDocument = document;
		for (let i = 0; i < previewsToUpdate.length; i++) {
			previewsToUpdate[i].panel.webview.postMessage({ command: 'updateTitle', content: output.titleHtml });
			previewsToUpdate[i].panel.webview.postMessage({ command: 'updateScript', content: output.scriptHtml });
			
			if(previewsToUpdate[i].dynamic) {

				previewsToUpdate[i].uri = document.uri.toString();
				previewsToUpdate[i].panel.webview.postMessage({ command: 'setstate', uri: previewsToUpdate[i].uri});
			}
		}
	}
	parsedDocuments.set(document.uri.toString(), output);
	var tokenlength = 0;
	const decorsDialogue: vscode.DecorationOptions[] = [];
	tokenlength = 0;
	parsedDocuments.get(document.uri.toString()).properties.titleKeys = [];
	var fontTokenExists = false;
	while (tokenlength < output.title_page.length) {
		if (output.title_page[tokenlength].type == "font" && output.title_page[tokenlength].text.trim() != "") {
			parsedDocuments.get(document.uri.toString()).properties.fontLine = output.title_page[tokenlength].line;
			var fontname = output.title_page[tokenlength].text;
			previewsToUpdate.forEach(p => {
				p.panel.webview.postMessage({ command: 'updateFont', content: fontname });
			});
			fontTokenExists = true;
			fontTokenExisted = true;
		}
		tokenlength++;
	}
	if (!fontTokenExists && fontTokenExisted) {
		previewsToUpdate.forEach(p => {
			p.panel.webview.postMessage({ command: 'removeFont' });
		});
		fontTokenExisted = false;
		diagnosticCollection.set(document.uri, []);
	}
	var editor = getEditor(document.uri);
	if(editor) editor.setDecorations(decortypesDialogue, decorsDialogue)

	if (document.languageId == "fountain")
		outlineViewProvider.update();
	updateStatus(output.lengthAction, output.lengthDialogue);
	ShowDecorations(document.uri);

	let t1 = performance.now()
	let parseTime = t1-t0;
	console.info("parsed in " + parseTime);
	if(parseTelemetryLimiter == parseTelemetryFrequency){
		telemetry.reportTelemetry("afterparser.parsing", undefined, { linecount: document.lineCount, parseduration: 5 });
	}
	parseTelemetryLimiter--;
	if(parseTelemetryLimiter == 0 ) parseTelemetryLimiter = parseTelemetryFrequency;

}

vscode.window.onDidChangeActiveTextEditor(change => {
	if(change == undefined || change.document == undefined) return;
	if (change.document.languageId == "fountain") {
		parseDocument(change.document);
		/*if(previewpanels.has(change.document.uri.toString())){
			var preview = previewpanels.get(change.document.uri.toString());
			if(!preview.visible && preview.viewColumn!=undefined)
				preview.reveal(preview.viewColumn);
		}*/
	}
})



vscode.workspace.onDidCloseTextDocument(e=>{
	parsedDocuments.delete(e.uri.toString());
});