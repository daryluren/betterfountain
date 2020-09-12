import * as vscode from 'vscode';
import { token } from '../token';
import { getEditor } from '../extension';
import { FountainConfig } from "../configloader";

const emptyDecorationType = vscode.window.createTextEditorDecorationType({
  //border: '1px solid yellow',  // for debugging
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen
});

var TYPEWRITERCOLS = 57;
const DIALOGUECOL = 9; //ideally 9
const PARENTHETICALCOL = DIALOGUECOL + 4;
const CHARACTERCOL = PARENTHETICALCOL + 5;
const PADDINGCHAR = '~';//String.fromCharCode(160);
/* vscode ignores the decoration string if it's empty/whitespace. we use non-breaking-space char to get around this */

export var decorations: vscode.DecorationOptions[] = [];

export function AddDecoration(config: FountainConfig, type: "dialoguenumber" | "transition" | "dialogue" | "parenthetical" | "centered", thisToken: token) {
  /* attach this to a new setting once the vscode decoration-wordwrap bug is fixed 
  ** https://github.com/microsoft/vscode/issues/32856
  
    these rulers are good for debugging with
    "[fountain]": {
        "editor.wordWrapColumn": 57,
        "editor.wordWrap": "wordWrapColumn",
        "editor.glyphMargin": true,
        "editor.rulers": [9,57,18,47] 
    }
  */
  const settingPreviewInEditor = true;

  TYPEWRITERCOLS = config.wordWrapColumn;

  if (type === "dialoguenumber") {
    if (config.print_dialogue_numbers)
      AddDialogueNumberDecoration(thisToken, settingPreviewInEditor);
    else if (settingPreviewInEditor)
      LeftPad(thisToken, CHARACTERCOL);
  }

  if (settingPreviewInEditor && type === "parenthetical")
    LeftPad(thisToken, PARENTHETICALCOL + CompensateInternalWhitespace(thisToken.unformattedText));

  if (settingPreviewInEditor && type === "transition")
    AddTransitionDecoration(thisToken);

  if (settingPreviewInEditor && type === "dialogue")
    AddDialogueDecoration(thisToken);

  if (settingPreviewInEditor && type === "centered")
    LeftPad(thisToken, Math.floor((TYPEWRITERCOLS - thisToken.unformattedText.length) / 2));
}

function AddDialogueNumberDecoration(thisToken: token, mustAddMargin: boolean) {
  const dialogueNumberLabel = thisToken.takeNumber.toString() + " - ";
  const existingPadding = thisToken.unformattedText.match(/^\s+/);
  var padAmount = mustAddMargin ? CHARACTERCOL - dialogueNumberLabel.length : 0;
  padAmount -= (existingPadding ? existingPadding[0].length : 0);

  const text = PADDINGCHAR.repeat(padAmount) + dialogueNumberLabel;
  const decRange = new vscode.Range(new vscode.Position(thisToken.line, 0), new vscode.Position(thisToken.line, text.length));
  decorations.push({ range: decRange, renderOptions: { before: { contentText: text, textDecoration: ";opacity:0.5;", color: new vscode.ThemeColor("editor.foreground") } } });
}

function AddTransitionDecoration(thisToken: token) {
  LeftPad(thisToken, TYPEWRITERCOLS - thisToken.unformattedText.length)
}

function CompensateInternalWhitespace(text: string) {
  const existingPadding = text.match(/^\s+/)
  return (existingPadding ? -existingPadding[0].length : 0)
}

function AddDialogueDecoration(thisToken: token) {
  const dialogueWidth = TYPEWRITERCOLS - DIALOGUECOL - DIALOGUECOL - 1;
  const dialogueLineBreakRegEx = new RegExp(".{1," + dialogueWidth + "}(?:\\s|-|.$)\\s*", "g");
  var match: RegExpExecArray;
  while ((match = dialogueLineBreakRegEx.exec(thisToken.unformattedText)) != null)
    InsertDialoguePadding(thisToken, match);
}

function InsertDialoguePadding(token: token, match: RegExpExecArray) {
  try {
    const leftPad = DIALOGUECOL;
    const rightPad = TYPEWRITERCOLS - leftPad - match[0].length;
    const decRange = new vscode.Range(new vscode.Position(token.line, match.index), new vscode.Position(token.line, match.index + match[0].length - ( match[0].match(/[\s-]$/) ? 1 : 0)));
    const leftDecText = PADDINGCHAR.repeat(leftPad);
    const rightDecText = PADDINGCHAR.repeat(rightPad);
    decorations.push({
      range: decRange, renderOptions: {
        before: { contentText: leftDecText, textDecoration:";opacity:0.5;", color:"red" },
        after: { contentText: rightDecText, textDecoration:";opacity:0.5;", color:"yellow" }
      }
    });
  }
  catch (ex) {
    console.error(ex);
  }
}

function LeftPad(thisToken: token, amount: number) {
  try {
    if (amount <= 0)
      return;
    const decRange = new vscode.Range(new vscode.Position(thisToken.line, 0), new vscode.Position(thisToken.line, 1));
    const repeat = PADDINGCHAR.repeat(amount);
    decorations.push({ range: decRange, renderOptions: { before: { contentText: repeat } } });
  }
  catch (ex) {
    console.error(ex);
  }
}

export function ClearDecorations() {
  decorations = [];
}

export function ShowDecorations(vscode: vscode.Uri) {
  getEditor(vscode).setDecorations(emptyDecorationType, decorations)
}
