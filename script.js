window.onload = function () {
    'use strict';
    
    var tsvInput = document.getElementById('tsv-input');
    var learnBtn = document.getElementById('learn');
    var text = 'nothing';
    var dataLines;
    var tsvLine;
    var attributes = [];
    var record;
    var strippedType;
    var unusedAttrCount = 0;
    var classes;
    var splittedSets;
    var uniqueValue;
    
    var TreeNode = function () {
        this.entries = [];
        this.children = [];
    };
    
    var root = new TreeNode();
    
    TreeNode.prototype.addEntry = function (newEntry) {
        this.entries.push(newEntry);
    };
    
    TreeNode.prototype.popEntry = function() {
        this.entries.pop();
    };
    
    TreeNode.prototype.addChild = function(childNode) {
        this.children.push(childNode);
    };
    
    TreeNode.prototype.removeChild = function() {
        this.children.pop();
    };
    
    tsvInput.addEventListener('change', function () {
        var file = tsvInput.files[0];
        var reader = new FileReader();
        
        reader.onload = function (e) {
            text = reader.result;
        };
        
        reader.readAsText(file);
    });
    
    learnBtn.addEventListener('click', function (evt) {
        evt.preventDefault();
        dataLines = text.split('\n');
        attributes = [];
        classes = [];
        tsvLine = dataLines[0].split('\t');
        for (var i=0;i<tsvLine.length;i++) {
            attributes.push({
                name: tsvLine[i],
                isUsed: false,
                values: []
            });
            strippedType = tsvLine[i].slice(tsvLine[i].length-3,-1);
            attributes[i].type = strippedType[1];
        };
        for (var i=1;i<dataLines.length;i++) {
            tsvLine = dataLines[i].split('\t');
            record = new Map(); 
            for (var j=0;j<tsvLine.length;j++) {
                record.set(attributes[j].name,tsvLine[j]);
                if (attributes[j].type == 'd') {
                    uniqueValue = true;
                    for (var k=0;k<attributes[j].values.length;k++) {
                        if (attributes[j].values[k] == tsvLine[j]) {
                            uniqueValue = false;
                        }
                    }
                    if (uniqueValue) attributes[j].values.push(tsvLine[j]);
                };
                if (attributes[j].type == 'g') {
                    uniqueValue = true;
                    for (var k=0;k<classes.length;k++) {
                        if (classes[k] == tsvLine[j]) {
                            uniqueValue = false;
                        }
                    }
                    if (uniqueValue) classes.push(tsvLine[j]);
                };
            };
        };
        root.popEntry();
        unusedAttrCount = attributes.length;
      //  generateTree(root);
    });
    
    
    function generateTree(node) {  
        if (unusedAttrCount) {
            for (var i=0;i<attributes.length;i++) {
                switch(attributes[i].type) {
                    case 'q':
                        break;
                    case 'd':
                        break;
                    default:
                        break;
                }
            };
        } else {
            console.log('');
        }
    };
};