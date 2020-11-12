*The statistics page is currently being completely rethought (see the `feature-statsrevamp` branch) so there won't be any updates to it until the revamped version is ready. But when it is, it'll probably be the most advanced screenplay statistic systems available.*

**If you like BetterFountain, please consider [sponsoring me on GitHub](https://github.com/sponsors/piersdeseilligny). I spend a lot of energy on this project, and any contribution would mean the world to me**

## **1.6.11** - *2020-11-08*
    + Add "Parenthetical New Line Helper" setting - Disabling it will fix BetterFountain's compatibility with Vim emulators!
    · Fix forced action (!Lines which start like this) being interpreted as a transition if they end with 'TO:' (Issue #92)
    · Fix parsing, preview, and export of dialogue with forced line breaks (an 'empty' line with only two spaces)

## **1.6.10** - *2020-10-23*
    · Fixed inline notes replacing the entire action block
    · Notes for sections now also appear as a description in the outline

## **1.6.9** - *2020-10-22*
    + "(MORE)" and "(CONT'D)" text can now be changed in the settings (Thanks @rnwzd for the PR!)
    · Very minor adjustments to some descriptions in the PDF Settings

## **1.6.8** - *2020-10-05*
    + Add icons to outline
    + Notes now show in the outline (toggle-able)
    · Synopses now show in the correct order in the outline

## **1.6.7** - *2020-08-24*
    + Character extensions can now contain typesetters apostrophes (’) in addition to typewritters apostrophes (')

## **1.6.6** - *2020-08-16*
    + Any line (except action) can now start with spaces or tabs

## **1.6.5** - *2020-07-16*
    + Synopses are now included in the outline (can be toggled on/off)
    + Folding for sections! (Finally)
    + Infinite potential outline depth (Thanks @daryluren for the PR!)
    + Improved syntax highlighting (Thanks @daryluren for the PR!)
    + Anonymized telemetry (respects vscode's "Enable telemetry" toggle)




## **1.6.4** - *2020-06-22*
    + Add page count to statistics
    + Fix multiple sections in a row preventing PDF Creation when bookmarks are enabled
    + Fix synopses not being syntax highlighted

## **1.6.3** - *2020-06-21*
    + Fix scene numbers displaying as sourceline_nb in live preview (Fix #68, thanks Gabriel Guedes for reporting it!)
    + Base screenplay statistics on afterparser tokens, rather than even more regex (Thanks @daryluren for the PR!)

## **1.6.2** - *2020-06-19*
    + Add Bookmarks to the exported PDF for scene and section headers (enabled by default)

## **1.6.1** - *2020-06-18*
    + Improvement to Character autocomplete suggestions - the last taling character is no longer ommited, and all characters from the screenplay are also included. Writing quick dialogue between two characters is still blazing fast (as the smart character ordering is retained), but this change makes writing multiple sequential character lines faster too (Fixes Bug #63)

## **1.6.0**  - *2020-06-16*
    + New Icon
    + Complete overhaul of the previewing system
        + Scroll-sync is finally available! It is bidirectional and awesome (Thanks Felix Batusic for setting the groundwork!)
        + Indicator for the active line in the editor (in the preview)
        + Double-click in the preview to open the editor at that location
        + Previews can now be "dynamic" (of whichever fountain document is active) or "static" (locked to a specified fountain document)
        + Previews now persist through restarts of vscode
    + Notifications for PDF Export (showing any errors, and allowing to open the file upon completion, or reveal it in the file explorer)
    · Fixed bug #29 (Fountain panel outline not working in the preview)
    · Fixed bug #30 (Incorrect Spacing After Dual Dialogue When Exported to PDF)


## **1.5.0** - *2020-05-27*
    + Add symbol-based outline - the "path" of the current scene now shows above the editor, and the 
      integrated "outline" section of vscode now shows the screenplay's outline.
    + Add "Number all scenes" command and "Number scenes on save"  (Thanks Rick Schubert for the PR!)
    + Add "Show Dialogue Numbers" setting (Thanks Felix Batusic for the PR!)
    · Improved parenthetical formatting in exported PDF (to align with
      industry standard formatting of multi-line parentheticals)
    · Fix statistics incorrectly counting characters
    · More maintainable and clearer codebase

## **1.4.5** - *2020-04-14*
    · Align "(MORE)" with character, rather than parenthetical

## **1.4.4** - *2020-04-12*
    + Add keybinding to display preview (Ctrl+Shift+V, or Cmd+Shift+V)
    + Add statistics (contributed by @rickshubert)
    · Fix 'double space to render next line as part of dialogue' override (#53)
    · Fix all-caps action lines (#50)
    · Fix unicode apostrophe detection for macOS

## **1.4.3** - *2019-08-27*
    + Add option to disable noise texture in live preview

## **1.4.2** - *2019-07-31*
    · Improved parsing performance down to under 10ms for a 4000 line script
    · Fixed autosuggested recurring locations appearing multiple times
    - Removed webpack bundling, because it broke the PDF export feature (pdfkit really doesn't play nice with webpack + node)

## **1.4.1** - *2019-07-29*
    + Extension is now bundled with webpack, leading to a 10x smaller package size (0.5MB instead of 5.9MB!) and significantly faster startup times
    + Added instructions for "typewriter mode" in FAQ page (Thanks to @chainick!)
    - Removed syllable-based dialogue duration estimation, improving parsing speed by 8-10x
    - Removed useless console.log() calls (Thanks to @rickschubert!)

## **1.4.0** - *2019-07-27*
    + Smarter character autocomplete for dialogues, in the style of Final Draft (Thanks to @rickschubert!)
    + Improved duration estimate, which now only uses dialogue and action blocks to produce an estimate.
    · Fixed broken scene folding
    · Fixed forced scene headers being incorrectly highlighted (Thanks to @zoltair!)
    · Slightly reduced extension size

## **1.3.1** - *2019-04-30*
    · Fixed "draft date" missing from PDF
    · Fixed "double space between scenes" option
    · Fixed unwanted carrier return from synopsis lines in PDF

## **1.3.0** - *2019-04-14*
    + Live preview improvements
            + Option to change the theme from "vscode" (the same colors as vscode) to "paper" (white background) in the settings
            + Scale to fit (no more horizontal scrollbars)
    + Completely revamped autocomplete
            + More responsive title page key suggestions (shows when entering a new line)
            + Title page value suggestions (such as "written by" for 'credit:', your system username for 'author:', or the current date for 'date:')
            + Different scene header suggestions for int/ext, location, and time of day
            + Context-aware suggestions for character names (characters present in the current scene will be suggested in priority)
    + Replaced default font in preview and PDF with "Courier Prime" (prettier and supports more characters)
    + Custom fonts
            + Added "Font:" title page key to customize the font in the preview + pdf
            + Auto-complete for "font:" based on available fonts (any font installed on the OS)
    + Changing settings will update the live preview in real-time
    + Syntax highlighting fully consistent with tokenization for scene headers
    + Replaced language server with direct implementation
    · "bUg FiXeS and iMpROvEmeNTs"

## **1.2.2** - *2019-04-12*
    + Support for international character names (such as MAËLLE or АДРИАН)

## **1.2.1** - *2019-03-21*
    + Support for periods in character names
    · Fixed exporting PDF to usletter size
    + Support for "watermark" title page key

## **1.2.0** - *2019-01-30*
    + Integrated the PDF Export functionality straight into the extension (rather than using afterwriting CLI)
    + Replaced fountain-js parser with afterwriting-based parser
    · Fixed syntax highlighting for forced screen headers
    · Fixed boneyard showing up in the live preview
    · Reduced extension size from 14MB to 5MB
    - Removed the warning added in 1.1.4 (export is now based on the current document, saved or not)
    + Support for scene numbers and bold scene headers in live preview

## **1.1.4** - *2019-01-08*
    + Warning when trying to export PDF of unsaved file
    · Completely fixed pdf save dialog filter

## **1.1.3**
    + Notes now show in the live preview

## **1.1.2**
    · Fixed syntax highlighting on Linux (Thank you zoltair for reporting it!)
    · Fixed PDF save dialog on Mac OS (Thank you Mark Ainsworth!)

## **1.1.1**
    · Fixed bug where estimated runtime would be wrong in any non-GMT timezone (Thank you Henry Quinn!)

## **1.1.0**
    + Fountain section in the activity bar, with a clickable screenplay structure

## **1.0.2** - *2018-10-01*
    + Enter key auto skips-to-new-line at the end of character extensions ("O.S.", "CONT'D", etc...)
    + New icon
    + Approximate screenplay duration in the status bar
    + Disabled the integrated word based suggestions by default

## **1.0.1** - *2018-09-29*
    + Added settings for PDF Export
    + Brackets automatically close
    · Fixed syntax highlighting for centered text with special characters (> SOMETHING & SOMETHING <)
    · Fixed syntax highlighting for notes ([[notes]])
    + Editor text wraps by default
    + Added changelog

## **1.0.0** - *2018-09-28*
    Initial version