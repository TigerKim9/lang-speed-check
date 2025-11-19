const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Temp directory for code files
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

// Language configurations
const languageConfigs = {
    c: {
        extension: '.c',
        compile: (file, output) => `gcc ${file} -o ${output} -O2`,
        run: (output) => output,
        cleanup: (file, output) => [file, output]
    },
    rust: {
        extension: '.rs',
        compile: (file, output) => `rustc ${file} -o ${output} -O`,
        run: (output) => output,
        cleanup: (file, output) => [file, output]
    },
    go: {
        extension: '.go',
        compile: null,
        run: (file) => `go run ${file}`,
        cleanup: (file) => [file]
    },
    dart: {
        extension: '.dart',
        compile: null,
        run: (file) => `dart run ${file}`,
        cleanup: (file) => [file]
    },
    python: {
        extension: '.py',
        compile: null,
        run: (file) => `python3 ${file}`,
        cleanup: (file) => [file]
    },
    javascript: {
        extension: '.js',
        compile: null,
        run: (file) => `node ${file}`,
        cleanup: (file) => [file]
    },
    java: {
        extension: '.java',
        compile: (file, output, className) => `javac ${file}`,
        run: (file, output, className, dir) => `java -cp ${dir} ${className}`,
        cleanup: (file, output, className, dir) => [file, path.join(dir, `${className}.class`)]
    },
    zig: {
        extension: '.zig',
        compile: null,
        run: (file) => `zig run ${file}`,
        cleanup: (file) => [file]
    },
    cpp: {
        extension: '.cpp',
        compile: (file, output) => `g++ ${file} -o ${output} -O2`,
        run: (output) => output,
        cleanup: (file, output) => [file, output]
    },
    ruby: {
        extension: '.rb',
        compile: null,
        run: (file) => `ruby ${file}`,
        cleanup: (file) => [file]
    },
    php: {
        extension: '.php',
        compile: null,
        run: (file) => `php ${file}`,
        cleanup: (file) => [file]
    },
    swift: {
        extension: '.swift',
        compile: null,
        run: (file) => `swift ${file}`,
        cleanup: (file) => [file]
    },
    kotlin: {
        extension: '.kt',
        compile: (file, output) => `kotlinc ${file} -include-runtime -d ${output}.jar`,
        run: (output) => `java -jar ${output}.jar`,
        cleanup: (file, output) => [file, `${output}.jar`]
    }
};

// Execute code endpoint
app.post('/api/execute', async (req, res) => {
    const { language, code } = req.body;

    if (!language || !code) {
        return res.status(400).json({ error: 'Language and code are required' });
    }

    const config = languageConfigs[language.toLowerCase()];
    if (!config) {
        return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    const id = uuidv4();
    const fileName = `code_${id}${config.extension}`;
    const filePath = path.join(TEMP_DIR, fileName);
    const outputPath = path.join(TEMP_DIR, `output_${id}`);

    // For Java, extract class name
    let className = 'Main';
    if (language.toLowerCase() === 'java') {
        const classMatch = code.match(/public\s+class\s+(\w+)/);
        if (classMatch) {
            className = classMatch[1];
        }
    }

    try {
        // Write code to file
        fs.writeFileSync(filePath, code);

        // Compile if needed
        if (config.compile) {
            const compileCmd = config.compile(filePath, outputPath, className);
            await new Promise((resolve, reject) => {
                exec(compileCmd, { timeout: 30000 }, (error, stdout, stderr) => {
                    if (error) {
                        reject(new Error(`Compilation error: ${stderr || error.message}`));
                    } else {
                        resolve();
                    }
                });
            });
        }

        // Run and measure time
        const runCmd = config.run(
            config.compile ? outputPath : filePath,
            outputPath,
            className,
            TEMP_DIR
        );

        const startTime = process.hrtime.bigint();

        const result = await new Promise((resolve, reject) => {
            exec(runCmd, { timeout: 60000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
                const endTime = process.hrtime.bigint();
                const executionTime = Number(endTime - startTime) / 1e6; // Convert to milliseconds

                if (error && !stdout) {
                    reject(new Error(`Runtime error: ${stderr || error.message}`));
                } else {
                    resolve({
                        output: stdout,
                        stderr: stderr,
                        executionTime: executionTime.toFixed(3)
                    });
                }
            });
        });

        res.json(result);

    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        // Cleanup
        try {
            const filesToClean = config.cleanup(filePath, outputPath, className, TEMP_DIR);
            filesToClean.forEach(file => {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            });
        } catch (e) {
            // Ignore cleanup errors
        }
    }
});

// Get supported languages
app.get('/api/languages', (req, res) => {
    res.json(Object.keys(languageConfigs));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
