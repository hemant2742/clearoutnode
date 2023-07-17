const readline = require("readline-sync");
const { promises: fs } = require("fs");
const mongoose = require("mongoose");

(async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/report", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    db.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    const WordOccurrenceSchema = new mongoose.Schema({
      fileName: String,
      fileSize: Number,
      totalWords: Number,
      wordOccurrences: {
        the: Number,
        on: Number,
        instead: Number,
      },
    });

    function countOccurrences(array, searchElement) {
      return array.reduce((count, element) => {
        if (element.toLowerCase() === searchElement.toLowerCase()) {
          count++;
        }
        return count;
      }, 0);
    }

    const WordOccurrence = mongoose.model(
      "WordOccurrence",
      WordOccurrenceSchema
    );

    const filePath = readline.question("Enter the file path: ");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const words = fileContent.split(/\s+/);
    const totalWords = words.length;
    const wordOccurrences = {
      the: countOccurrences(words, "the"),
      on: countOccurrences(words, "on"),
      instead: countOccurrences(words, "instead"),
    };
    const fileStats = await fs.stat(filePath);
    const fileSize = fileStats.size;

    const wordOccurrence = new WordOccurrence({
      fileName: filePath,
      fileSize,
      totalWords,
      wordOccurrences,
    });
    await wordOccurrence.save();

    console.log("Report saved successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error occurred:", error);
    process.exit(1);
  }
})();
