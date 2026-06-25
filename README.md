# Language Learning Workspace & LingoFlip App

Welcome! This workspace is designed for practicing and mastering vocabulary in multiple languages (Deutsch, English, 日本語). 

It features **LingoFlip**, a premium, offline-capable flashcard web application that reads your markdown notes directly from your browser and generates custom study sessions, multiple-choice quizzes, and rule-based gender trainers.

---

## 📁 Repository Structure

*   **[Deutsch/](file:///c:/Users/user/Desktop/Language/Deutsch/)**: German vocabulary lists and suffix-gender learning notes.
    *   [Deutch Gender Learn.md](file:///c:/Users/user/Desktop/Language/Deutsch/Deutch%20Gender%20Learn.md): Key suffix rules for mapping word endings to German articles (*der*, *die*, *das*).
    *   [Deutsch word list.md](file:///c:/Users/user/Desktop/Language/Deutsch/Deutsch%20word%20list.md): A collection of German vocabulary cards formatted as a markdown table.
*   **[English/](file:///c:/Users/user/Desktop/Language/English/)**: English vocabulary lists for TOEIC and IELTS preparation.
    *   [Vocabulary.md](file:///c:/Users/user/Desktop/Language/English/Vocabulary.md): Core flashcards list.
    *   [Vocabulary-rules.md](file:///c:/Users/user/Desktop/Language/English/Vocabulary-rules.md): transition phrases and academic synonyms lists.
*   **[日本語/](file:///c:/Users/user/Desktop/Language/日本語/)**: Japanese vocabulary notes.
*   **[flashcards/](file:///c:/Users/user/Desktop/Language/flashcards/)**: The core engine of the **LingoFlip** flashcard application.

---

## ⚡ How to Use the Flashcard App (Quick Start)

It is super simple for you or your friends to study vocabulary:

1.  Open the **[flashcards/](file:///c:/Users/user/Desktop/Language/flashcards/)** directory.
2.  Double-click **[index.html](file:///c:/Users/user/Desktop/Language/flashcards/index.html)** to run the app in your browser (no installation or internet required!).
3.  Click **"Choose Notes Folder"** or drag and drop the top-level `Language/` folder into the drop zone.
4.  LingoFlip will scan all subdirectories, extract your vocabulary cards, and compile them into interactive decks.

---

## 🚀 Key Features

*   **Offline & Private**: Runs entirely in the browser. None of your notes or study progress are sent to any external server.
*   **Spaced Repetition (SRS)**: Employs a Leitner-style sorting algorithm. Rate cards as *Easy*, *Medium*, or *Hard*; harder words will automatically appear more frequently.
*   **Text-to-Speech (TTS)**: Automatically reads terms aloud with native accents (supports German, English, and Japanese synthesizers).
*   **German Suffix-Gender Game**: Parses suffix files and lets you play a custom multiple-choice game to master *der/die/das* rules.
*   **Interactive Quizzes**: Test your knowledge with dynamically generated multiple-choice quizzes.
*   **Gamification**: Features a daily study streak counter with visual celebration effects on card completion.
*   **Keyboard Shortcuts**: Fast-paced studying with keyboard bindings:
    *   `Space` - Flip card / Reveal answer
    *   `1` - Mark as Hard (review immediately)
    *   `2` - Mark as Medium (review soon)
    *   `3` - Mark as Easy (mastered)
