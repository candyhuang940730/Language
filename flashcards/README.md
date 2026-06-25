# LingoFlip - Premium Offline Flashcards App

**LingoFlip** is a client-side web application designed to turn your markdown language notes into high-fidelity, interactive flashcard decks. It runs locally in any modern browser without external servers or databases, ensuring total privacy.

---

## 📁 Language Formatting Guide

LingoFlip extracts flashcards based on how you write your notes. Below are the specific templates and guidelines for English, Deutsch, and future languages.

### 1. English Note Format (`English/`)
For English vocabulary prep (like TOEIC or IELTS), use a clean table or inline lists. You can add extra details like synonyms, parts of speech, or example sentences.

*   **Markdown Table Format (Recommended)**:
    ```markdown
    | Word | Meaning | Details |
    | --- | --- | --- |
    | mitigate | to make something less harmful or serious | Verb - Example: Governments must act swiftly to mitigate climate risks. |
    | detrimental | causing harm or damage | Adjective - Example: Too much screen time can be detrimental. |
    ```
*   **Inline List Format**:
    ```markdown
    - paramount : more important than anything else
    - diligent :: hard-working and attentive
    ```

---

### 2. Deutsch Note Format (`Deutsch/`)
LingoFlip features custom logic tailored for German grammar:
*   **Color-Coded Gender Highlights**: If your card's front side starts with the articles `der`, `die`, or `das`, LingoFlip automatically color-codes the text (Blue for masculine, Pink for feminine, and Green for neuter) so you can memorize noun genders visually!
*   **German Word Lists**:
    ```markdown
    | Word | Meaning | Details |
    | --- | --- | --- |
    | der Hund | dog | Noun - Plural: die Hunde |
    | die Katze | cat | Noun - Plural: die Katzen |
    | das Buch | book | Noun - Plural: die Bücher |
    ```
*   **Suffix-Gender Trainer Rules (`Deutch Gender Learn.md`)**:
    To feed rules into the **German Suffix Game**, create a note containing suffix lists grouped under headers:
    ```markdown
    ### Feminine(46%, Die):
    - -ung
    - -heit
    - -keit

    ### masculine(34%, Der):
    - -or
    - -ismus
    - -er

    ### Neuter(20%, Das):
    - -chen
    - -lein
    ```

---

### 3. Future Language Extensibility (Any New Language!)
LingoFlip is built to grow with you. If you or your friends want to learn a new language, you don't need to change any code!

#### How to Add a New Language:
1.  **Create a New Folder**: In your main notes directory, create a new subfolder named after the language, e.g., `Spanish`, `French`, `Italian`, `Chinese`, `Korean`, `Dutch`, etc.
2.  **Add Markdown Files**: Write your vocabulary notes in that folder using tables or inline lists.
3.  **Automatic Detection**:
    *   LingoFlip reads the subfolder name (e.g., `Spanish`) and automatically names the deck after it.
    *   **Text-to-Speech (TTS)**: LingoFlip automatically maps the subfolder name to its corresponding speech accent locale!

#### Supported Out-of-the-Box TTS Languages:
*   **German / Deutsch**: `de-DE`
*   **English**: `en-GB` / `en-US`
*   **Japanese / 日本語**: `ja-JP`
*   **Spanish / Español**: `es-ES`
*   **French / Français**: `fr-FR`
*   **Italian / Italiano**: `it-IT`
*   **Dutch / Nederlands**: `nl-NL`
*   **Danish / Dansk**: `da-DK`
*   **Portuguese / Português**: `pt-PT`
*   **Swedish / Svenska**: `sv-SE`
*   **Norwegian / Norsk**: `no-NO`
*   **Icelandic / Íslenska**: `is-IS`
*   **Chinese / 中文**: `zh-CN`
*   **Korean / 한국어**: `ko-KR`

*Note: Any other folder names will default to English speech synthesis (`en-US`).*

---

## 🛠️ How to Start Studying

1.  Open the `flashcards/` folder in your file explorer.
2.  Double-click **[index.html](file:///c:/Users/user/Desktop/Language/flashcards/index.html)**.
3.  Click the **"Choose Notes Folder"** button or drag and drop your root language notes folder into the drop zone.
4.  Your dashboard will update instantly with loaded decks, stats, and settings controls. Click **Study**, **Quiz**, or **Play Game** to begin.

---

## 🚀 Key Features

*   **Offline & Private**: Runs entirely in the browser. None of your notes or study progress are sent to any external server.
*   **Spaced Repetition (SRS)**: Employs a Leitner-style sorting algorithm. Rate cards as *Easy*, *Medium*, or *Hard*; harder words will automatically appear more frequently.
*   **Text-to-Speech (TTS)**: Automatically reads terms aloud with native accents (supports speed rate control).
*   **Interactive Quizzes**: Test your knowledge with dynamically generated multiple-choice quizzes.
*   **Gamification**: Features a daily study streak counter with visual celebration effects on card completion.
*   **Theme Toggle**: Beautiful dark mode and light mode templates.
*   **Keyboard Bindings**:
    *   `Space` - Flip card / Reveal answer
    *   `1` - Mark as Hard
    *   `2` - Mark as Medium
    *   `3` - Mark as Easy
