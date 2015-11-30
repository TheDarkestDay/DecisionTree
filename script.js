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
    var uniqueDiscreteFieldValues;
    var splittedSets;
    
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
        tsvLine = dataLines[0].split('\t');
        for (var i=0;i<tsvLine.length;i++) {
            attributes.push({
                name: tsvLine[i],
                isUsed: false
            });
            strippedType = tsvLine[i].slice(tsvLine[i].length-3,-1);
            attributes[i].type = strippedType[1];
        };
        console.log(attributes);
        for (var i=1;i<dataLines.length;i++) {
            tsvLine = dataLines[i].split('\t');
            record = new Map(); 
            for (var j=0;j<tsvLine.length;j++) {
                record.set(attributes[j].name,tsvLine[j]);
                if (attributes[j].type == 'd') {
                    uniqueValue = true;
                    for (var k=0;k<uniqueDiscreteFieldValues.length;i++) {
                        if (uniqueDiscreteFieldValues == tsvLine[j]) {
                            uniqueValue = false;
                        }
                    }
                    if (uniqueValue) uniqueDiscreteFieldValues.push(tsvLine[j]);
                };
            };
        };
        root.popEntry();
        unusedAttrCount = attributes.length;
        generateTree(root);
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
            
        }
    };
};