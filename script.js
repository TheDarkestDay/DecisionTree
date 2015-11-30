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
            };
        };
        root.popEntry();
        
        
    });
};