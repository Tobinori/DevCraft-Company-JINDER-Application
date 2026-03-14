#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Repository structure analyzer
class RepoAnalyzer {
  constructor(rootPath = './') {
    this.rootPath = rootPath;
    this.duplicates = new Map();
    this.structure = {};
    this.issues = [];
  }

  analyzeStructure() {
    console.log('🔍 Analyzing repository structure...');
    this.scanDirectory(this.rootPath, this.structure);
    this.findDuplicates();
    this.identifyIssues();
    this.generateReport();
  }

  scanDirectory(dirPath, structure, level = 0) {
    if (level > 10) return; // Prevent infinite recursion
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        if (item.startsWith('.') && !item.includes('git')) continue;
        
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          structure[item] = {};
          this.scanDirectory(fullPath, structure[item], level + 1);
        } else {
          const fileInfo = this.getFileInfo(fullPath);
          structure[item] = fileInfo;
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dirPath}:`, error.message);
    }
  }

  getFileInfo(filePath) {
    const stat = fs.statSync(filePath);
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('md5').update(content).digest('hex');
    
    return {
      size: stat.size,
      modified: stat.mtime,
      hash,
      extension: path.extname(filePath),
      path: filePath
    };
  }

  findDuplicates() {
    const hashMap = new Map();
    
    this.traverseStructure(this.structure, '', (filePath, fileInfo) => {
      if (fileInfo.hash) {
        if (!hashMap.has(fileInfo.hash)) {
          hashMap.set(fileInfo.hash, []);
        }
        hashMap.get(fileInfo.hash).push(filePath);
      }
    });
    
    for (const [hash, files] of hashMap) {
      if (files.length > 1) {
        this.duplicates.set(hash, files);
      }
    }
  }

  traverseStructure(structure, currentPath, callback) {
    for (const [name, info] of Object.entries(structure)) {
      const fullPath = path.join(currentPath, name);
      
      if (info.hash) {
        // It's a file
        callback(fullPath, info);
      } else {
        // It's a directory
        this.traverseStructure(info, fullPath, callback);
      }
    }
  }

  identifyIssues() {
    // Check for common structural issues
    this.checkForMisplacedComponents();
    this.checkForInconsistentNaming();
    this.checkForDeepNesting();
    this.checkForMissingDirectories();
  }

  checkForMisplacedComponents() {
    const componentFiles = [];
    
    this.traverseStructure(this.structure, '', (filePath, fileInfo) => {
      const fileName = path.basename(filePath);
      if (fileName.includes('Component') || fileName.includes('.jsx') || fileName.includes('.vue')) {
        componentFiles.push(filePath);
      }
    });
    
    const componentsOutsideComponentsDir = componentFiles.filter(file => 
      !file.includes('/components/') && !file.includes('\\components\\')
    );
    
    if (componentsOutsideComponentsDir.length > 0) {
      this.issues.push({
        type: 'misplaced_components',
        severity: 'medium',
        files: componentsOutsideComponentsDir,
        description: 'Component files found outside components directory'
      });
    }
  }

  checkForInconsistentNaming() {
    const namingPatterns = new Map();
    
    this.traverseStructure(this.structure, '', (filePath, fileInfo) => {
      const fileName = path.basename(filePath, path.extname(filePath));
      const hasUpperCase = /[A-Z]/.test(fileName);
      const hasLowerCase = /[a-z]/.test(fileName);
      const hasUnderscore = fileName.includes('_');
      const hasHyphen = fileName.includes('-');
      
      const pattern = `${hasUpperCase ? 'U' : ''}${hasLowerCase ? 'L' : ''}${hasUnderscore ? '_' : ''}${hasHyphen ? '-' : ''}`;
      
      if (!namingPatterns.has(pattern)) {
        namingPatterns.set(pattern, []);
      }
      namingPatterns.get(pattern).push(filePath);
    });
    
    if (namingPatterns.size > 3) {
      this.issues.push({
        type: 'inconsistent_naming',
        severity: 'low',
        patterns: Array.from(namingPatterns.entries()),
        description: 'Multiple naming conventions detected'
      });
    }
  }

  checkForDeepNesting() {
    const deepPaths = [];
    
    this.traverseStructure(this.structure, '', (filePath, fileInfo) => {
      const depth = filePath.split(path.sep).length;
      if (depth > 5) {
        deepPaths.push({ path: filePath, depth });
      }
    });
    
    if (deepPaths.length > 0) {
      this.issues.push({
        type: 'deep_nesting',
        severity: 'medium',
        files: deepPaths,
        description: 'Files with excessive directory nesting detected'
      });
    }
  }

  checkForMissingDirectories() {
    const expectedDirs = ['src', 'components', 'utils', 'assets', 'tests'];
    const missingDirs = [];
    
    for (const dir of expectedDirs) {
      if (!this.structure[dir]) {
        missingDirs.push(dir);
      }
    }
    
    if (missingDirs.length > 0) {
      this.issues.push({
        type: 'missing_directories',
        severity: 'low',
        directories: missingDirs,
        description: 'Recommended directories not found'
      });
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      structure: this.structure,
      duplicates: Array.from(this.duplicates.entries()).map(([hash, files]) => ({
        hash: hash.substring(0, 8),
        files,
        size: files.length
      })),
      issues: this.issues,
      summary: {
        totalFiles: this.countFiles(),
        totalDuplicates: this.duplicates.size,
        totalIssues: this.issues.length,
        severityBreakdown: this.getSeverityBreakdown()
      }
    };
    
    fs.writeFileSync('structure-analysis.json', JSON.stringify(report, null, 2));
    console.log('✅ Analysis complete! Report saved to structure-analysis.json');
    
    this.printSummary(report);
  }

  countFiles() {
    let count = 0;
    this.traverseStructure(this.structure, '', () => count++);
    return count;
  }

  getSeverityBreakdown() {
    const breakdown = { high: 0, medium: 0, low: 0 };
    for (const issue of this.issues) {
      breakdown[issue.severity]++;
    }
    return breakdown;
  }

  printSummary(report) {
    console.log('\n📊 REPOSITORY ANALYSIS SUMMARY');
    console.log('================================');
    console.log(`Total Files: ${report.summary.totalFiles}`);
    console.log(`Duplicate Groups: ${report.summary.totalDuplicates}`);
    console.log(`Issues Found: ${report.summary.totalIssues}`);
    console.log(`  - High: ${report.summary.severityBreakdown.high}`);
    console.log(`  - Medium: ${report.summary.severityBreakdown.medium}`);
    console.log(`  - Low: ${report.summary.severityBreakdown.low}`);
    
    if (this.duplicates.size > 0) {
      console.log('\n🔄 DUPLICATE FILES:');
      for (const [hash, files] of this.duplicates) {
        console.log(`  ${hash.substring(0, 8)}: ${files.join(', ')}`);
      }
    }
    
    if (this.issues.length > 0) {
      console.log('\n⚠️  ISSUES DETECTED:');
      for (const issue of this.issues) {
        console.log(`  [${issue.severity.toUpperCase()}] ${issue.description}`);
      }
    }
  }
}

// Run analysis
if (require.main === module) {
  const analyzer = new RepoAnalyzer();
  analyzer.analyzeStructure();
}

module.exports = RepoAnalyzer;