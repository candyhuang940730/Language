# Local Language Flashcards App

This is a local, offline-capable web application that turns your markdown notes (Deutsch, English, 日本語) into interactive flashcards. It runs completely in your browser and stores your progress locally.

## Features
- **Zero Installation**: Simply open `index.html` in your web browser.
- **Privacy First**: Your notes never leave your computer. The app uses the HTML5 directory upload API to read notes locally.
- **Smart Parsing**: Automatically identifies files in your language folders and parses vocabulary lists.
- **Text-to-Speech (TTS)**: Reads words aloud in their native accents (German, English, Japanese).
- **Spaced Repetition**: Rate cards as Easy, Medium, or Hard. Harder cards appear more frequently.
- **German Suffix Game**: Interactive quiz based on suffix rules parsed directly from `Deutch Gender Learn.md`.

## Note Formatting Guidelines

To ensure the app parses your notes correctly, format them in any of the following ways:

### 1. Inline Flashcards (Double Colon or Arrow)
Ideal for quick lists:
```markdown
der Hund :: dog
das Buch :: book
die Katze -> cat
```

### 2. Bullet Point Lists
List items separated by a colon, hyphen, or arrow:
```markdown
- apple : a round fruit with red or green skin
- banana : a long yellow fruit
```

### 3. Markdown Tables
Use tables with column headers for structured lists:
| Deutsch | English | Pronunciation |
| --- | --- | --- |
| das Haus | house | [haʊs] |
| das Auto | car | [ˈaʊ̯to] |

### 4. German Suffix Rules (for `Deutch Gender Learn.md`)
The app specifically parses files like `Deutch Gender Learn.md` looking for gender groups and suffix bullet points:
```markdown
### Feminine(46%, Die):
- -ung
- -heit

### masculine(34%, Der):
- -or
- -er
```

## How to Run

1. Navigate to the `flashcards/` folder.
2. Double-click `index.html` to open it in your web browser.
3. Click **"Load Notes Folder"** and select your main `Language/` directory (or drag and drop it into the upload box).
4. Start studying!
