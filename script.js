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
    var type;
    var unusedAttrCount = 0;
    var classes;
    var splittedSets;
    var uniqueValue;
    var goalAttributeName;
    var subsetSum;
    var maxGain,currGain;
    var attributeForNextSplit;
    
    
    Math.log2 = Math.log2 || function(x) {
        return Math.log(x) / Math.LN2;
    };
    
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
    
    TreeNode.prototype.getEntries = function() {
        return this.entries;
    };
    
    TreeNode.prototype.getEntry = function(index) {
        return this.entries[index];
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
            strippedType = tsvLine[i].slice(tsvLine[i].length-3,-1);
            if (strippedType[1] == ')') {
                type = strippedType[0];
            } else {
                type = strippedType[1];
            }
            attributes.push({
                name: tsvLine[i],
                isUsed: false,
                values: [],
                type: type
            });
        };
        console.log(attributes);
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
                    goalAttributeName = attributes[j].name;
                    for (var k=0;k<classes.length;k++) {
                        if (classes[k] == tsvLine[j]) {
                            uniqueValue = false;
                        }
                    }
                    if (uniqueValue) classes.push(tsvLine[j]);
                };
            };
            root.addEntry(record);
        };
        root.popEntry();
        unusedAttrCount = attributes.length;
        generateTree(root);
    });
    
    
    function generateTree(node) {
        if (unusedAttrCount) {
            maxGain = 0;
            for (var i=0;i<attributes.length;i++) {
                splittedSets = [];
                switch(attributes[i].type) {
                    case 'q':
                        splittedSets = splitByContiniousAttr(node.getEntries(),attributes[i]);
                        break;
                    case 'd':
                        splittedSets = splitSetByDiscreteAttr(node.getEntries(),attributes[i]);
                        break;
                    default:
                        break;
                }
                if (attributes[i].type != 'g') {
                    console.log(splittedSets);
                    subsetSum = 0;
                    for (var j=0;j<splittedSets.length;j++) {
                        subsetSum += splittedSets[j].length/node.getEntries().length*calcEnthropy(splittedSets[j]);
                    }
                    currGain = calcEnthropy(node.getEntries())-subsetSum;
                    if (currGain > maxGain) {
                        maxGain = currGain;
                        attributeForNextSplit = attributes[i];
                    }
                }
            };
            console.log(maxGain);
            console.log(attributeForNextSplit);
        } else {
            console.log('');
        }
    };
    
    function splitSetByDiscreteAttr(set,attr) {
        var splittedSets = [];
        for (var i=0;i<attr.values.length;i++) {
            splittedSets.push([]);
            for (var j=0;j<set.length;j++) {
                if (set[j].get(attr.name) == attr.values[i]) {
                    splittedSets[i].push(set[j]);
                }
            }
        }
        return splittedSets;
    };
    
    function splitByContiniousAttr(set,attr) {
        var splittedSets = [];
        var median = 0;
        for (var i=0;i<set.length;i++) {
            median += parseInt(set[i].get(attr.name));
        };
        median = median/set.length;
        console.log(median);
        splittedSets.push([]);
        splittedSets.push([]);
        for (var i=0;i<set.length;i++) {
            if (parseInt(set[i].get(attr.name)) > median) {
                splittedSets[1].push(set[i]);
            } else {
                splittedSets[0].push(set[i]);
            }
        };
        return splittedSets;
    };
    
    function calcEnthropy(set) {
        var result = 0;
        var classMembersCount;
        for (var i=0;i<classes.length;i++) {
            classMembersCount = 0;
            for (var j=0;j<set.length;j++) {
                if (set[j].get(goalAttributeName) == classes[i]) {
                    classMembersCount++;
                };
            };
            if (classMembersCount == 0) {
                return 0;
            }
            result += classMembersCount/set.length*Math.log2(classMembersCount/set.length);
        };
        return -result;
    };
};