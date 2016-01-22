window.onload = function () {
    'use strict';
    
    var tsvInput = document.getElementById('tsv-input');
    var learnBtn = document.getElementById('learn');
    var queryForm = document.querySelector('#queryForm p');
    var queryBtn = document.getElementById('query');
    var answerSpan = document.getElementById('answer');
    var text = 'nothing';
    var dataLines;
    var tsvLine;
    var attributes = [];
    var allAttrs = [];
    var attrsInSplittingOrder = [];
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
    var bestPartition;
    var allEntriesInTheSameClass, sameClass;
    var parentSetStack;
    var queryEntry;
    var graph;
    var chart;
    var chartConfig;
    
    
    Math.log2 = Math.log2 || function(x) {
        return Math.log(x) / Math.LN2;
    };
    
    var TreeNode = function () {
        this.entries = [];
        this.children = [];
        this.label = '';
    };
    
    var root = new TreeNode();
    
    TreeNode.prototype.setLabel = function(lbl) {
        this.label = lbl;
    };
    
    TreeNode.prototype.getLabel = function() {
        return this.label;
    };
    
    TreeNode.prototype.addEntry = function (newEntry) {
        this.entries.push(newEntry);
    };
    
    TreeNode.prototype.popEntry = function() {
        this.entries.pop();
    };
    
    TreeNode.prototype.addChild = function(childNode) {
        this.children.push(childNode);
    };
    
    TreeNode.prototype.getChildNodes = function() {
        return this.children;
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
    
    queryBtn.addEventListener('click', function(evt) {
        evt.preventDefault();
        queryEntry = new Map();
        for (var i=0;i<allAttrs.length;i++) {
            if (allAttrs[i].type != 'g')
                queryEntry.set(allAttrs[i].name,document.getElementById(allAttrs[i].name).value);
        };
        var currNode = root;
        var currAttr = {};
        var answer = "";
        for (var i=0;i<attrsInSplittingOrder.length;i++) {
            currAttr = attrsInSplittingOrder[i];
            if (currNode.getLabel() != "") {
                answer = currNode.getLabel();
                break;
            } else {
                if (currAttr.type == 'q') {
                    if (parseInt(queryEntry.get(currAttr.name)) > currAttr.splittedBy) {
                        currNode = currNode.getChildNodes()[1];
                    } else {
                        currNode = currNode.getChildNodes()[0];
                    };
                } else {  
                    for (var j=0;j<currNode.getChildNodes().length;j++) {
                        if (currNode.getChildNodes()[j].getEntry(0).get(currAttr.name) == queryEntry.get(currAttr.name)) {
                            currNode = currNode.getChildNodes()[j];
                            break;
                        }
                    };
                };
            };
        };
        answerSpan.innerHTML = answer;
    });
    
    learnBtn.addEventListener('click', function (evt) {
        evt.preventDefault();
        dataLines = text.split('\n');
        attributes = [];
        classes = [];
        parentSetStack = [];
        graph = {
            text: {
                name: ''
            },
            children: []
        };
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
                values: [],
                type: type,
            });
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
        for (var i=0;i<attributes.length;i++) {
            allAttrs[i] = attributes[i];
        };
        generateQueryForm();
        generateTree(root,graph);
        console.log(root);
        console.log(graph);
        chartConfig = {
            chart: {
                container: '#graph-container'
            },
            nodeStructure: graph
        };
        chart = new Treant(chartConfig);
    });
        
    function generateTree(node,graph) {
        allEntriesInTheSameClass = false;
        if (node.getEntries().length) {
            allEntriesInTheSameClass = true;
            sameClass = node.getEntry(0).get(goalAttributeName);
            for (var i=0;i<node.getEntries().length;i++) {
                if (node.getEntry(i).get(goalAttributeName) != sameClass) {
                    allEntriesInTheSameClass = false;
                    break;
                }
            }
        };
        if (attributes.length && node.getEntries().length && !allEntriesInTheSameClass) {
            maxGain = -1;
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
                    subsetSum = 0;
                    for (var j=0;j<splittedSets.length;j++) {
                        subsetSum += splittedSets[j].length/node.getEntries().length*calcEnthropy(splittedSets[j]);
                    }
                    currGain = calcEnthropy(node.getEntries())-subsetSum;
                    console.log(attributes[i].name+" = "+currGain);
                    if (currGain > maxGain) {
                        maxGain = currGain;
                        attributeForNextSplit = attributes[i];
                        bestPartition = splittedSets;
                    };
                } else {
                    attributes.splice(i,1);
                };
            };
            console.log(node.getEntries());
            console.log('Splitting by '+attributeForNextSplit.name);
            console.log(bestPartition);
            graph.text.name = attributeForNextSplit.name;
            if (attributeForNextSplit.type == 'q') {
                attributeForNextSplit.splittedBy = calcMedian(node.getEntries(),attributeForNextSplit);
                graph.children.push({
                    text: { name:'<'+attributeForNextSplit.splittedBy},
                    children: [{
                        text: {
                            name: ''
                        },
                        children:[]
                    }]
                });
                graph.children.push({
                    text: { name:'>'+attributeForNextSplit.splittedBy },
                    children: [{
                        text:{
                            name: ''
                        },
                        children:[]
                    }]
                });
            } else {
                for (var k=0;k<attributeForNextSplit.values.length;k++) {
                    graph.children.push({
                        text:{ name: attributeForNextSplit.values[k]},
                        children: [{
                            text: { 
                                name: ''
                            },
                            children:[]
                        }]
                    });
                };
            };
            attrsInSplittingOrder.push(attributeForNextSplit);
            attributes.splice(attributes.indexOf(attributeForNextSplit),1);
            for (var i=0;i<bestPartition.length;i++) {
                var child = new TreeNode();
                for (var j=0;j<bestPartition[i].length;j++) {
                    child.addEntry(bestPartition[i][j]);
                };
                node.addChild(child);
            };
            parentSetStack.push(node);
            for (var j=0;j<node.getChildNodes().length;j++) {
                generateTree(node.getChildNodes()[j],graph.children[j].children[0]);
            };
            parentSetStack.pop();
        } else {
            if (allEntriesInTheSameClass) {
                node.setLabel(sameClass);
            } else {
                if (node.getEntries().length) {
                    node.setLabel(getMostCommonClass(node));
                } else {
                    node.setLabel(getMostCommonClass(parentSetStack[parentSetStack.length-1]));
                }
            };
            graph.text.name = node.getLabel();
        };
    };
    
    function calcMedian(set,attribute) {
        var result = 0;
        for (var i=0;i<set.length;i++) {
            result += parseInt(set[i].get(attribute.name));
        };
        return result/set.length;
    };
    
    function generateQueryForm() {
        queryForm.innerHTML = "";
        var fieldContainer;
        for (var i=0;i<attributes.length;i++) {
            switch(attributes[i].type) {
                case 'q':
                    var inputField = document.createElement('input');
                    fieldContainer = document.createElement('div');
                    var fieldLabel = document.createElement('label');
                    inputField.setAttribute('id',attributes[i].name);
                    inputField.setAttribute('type','number');
                    fieldContainer.setAttribute('class','widget');
                    fieldLabel.setAttribute('for',attributes[i].name);
                    fieldLabel.innerHTML = attributes[i].name+':';
                    fieldContainer.appendChild(fieldLabel);
                    fieldContainer.appendChild(inputField);
                    queryForm.appendChild(fieldContainer);
                    break;
                case 'd':
                    var dropdownList = document.createElement('select');
                    var listLabel = document.createElement('label');
                    fieldContainer = document.createElement('div');
                    fieldContainer.setAttribute('class','widget');
                    listLabel.innerHTML = attributes[i].name+":";
                    dropdownList.setAttribute('id',attributes[i].name);
                    for (var j=0;j<attributes[i].values.length;j++) {
                        var opt = document.createElement('option');
                        opt.setAttribute('value',attributes[i].values[j]);
                        opt.innerHTML = attributes[i].values[j];
                        dropdownList.appendChild(opt);
                    };
                    dropdownList.children[0].setAttribute('selected','true');
                    fieldContainer.appendChild(listLabel);
                    fieldContainer.appendChild(dropdownList);
                    queryForm.appendChild(fieldContainer);
                    break;
            };
        };
    };
    
    function getMostCommonClass(set) {
        var memberCounters = [];
        for (var i=0;i<classes.length;i++) {
            memberCounters.push(0);
        };
        for (var i=0;i<classes.length;i++) {
            for (var j=0;j<set.getEntries().length;j++) {
                if (set.getEntry(j).get(goalAttributeName) == classes[i]) memberCounters[i]++;
            };
        };
        var maxIndex = 0;
        for (var i=0;i<memberCounters.length;i++) {
            if (memberCounters[i] > memberCounters[maxIndex]) {
                maxIndex = i;
            };
        };
        return classes[maxIndex];
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
        var median = calcMedian(set,attr);
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
    
    
    /*********************************************************************
    *
    * TESTS
    *
    \*********************************************************************/
    
    
    describe('Tree node', function() {
        var testNode = new TreeNode(),
            testMap = new Map(),
            testChild = new TreeNode();
       
        it('initially should have empty label', function() {
            expect(testNode.label).toEqual('');
        });
        
        it('initially should have no entries', function() {
            expect(testNode.entries.length).toEqual(0);
        });
        
        it('initially should have no children', function() {
            expect(testNode.children.length).toEqual(0);
        });
        
        it('allows setting label through setLabel()', function() {
            testNode.setLabel('yes');
            expect(testNode.label).toEqual('yes');
        });
        
        it('allows getting label through getLabel()', function() {
            expect(testNode.getLabel()).toEqual('yes');
        });
        
        it('addEntry should add new entry', function() {
            testMap.set('Name','Igor');
            testNode.addEntry(testMap);
            expect(testNode.entries.length).toEqual(1);
        });
        
        it('getEntries should return array of all entries', function() {
            expect(testNode.getEntries().length).toEqual(1);
        });
        
        it('getEntry(k) should return entry number k', function() {
            expect(testNode.getEntry(0)).toEqual(testMap);
        });
        
        it('popEntry should remove entry', function() {
            testNode.popEntry();
            expect(testNode.getEntries().length).toEqual(0);
        });
        
        it('addChild should add child', function() {
            testNode.addChild(testChild);
            expect(testNode.children.length).toEqual(1);
        });
        
        it('allows to get all child nodes by using getChildNodes', function() {
            expect(testNode.getChildNodes()[0]).toEqual(testChild);
        });
        
    });
    
    describe('calc median function', function() {
        
        it('23.3 is a median for 16,33,21', function() {
            var entry1 = new Map(),
                entry2 = new Map(),
                entry3 = new Map(),
                ageAttr = {
                    name: 'age'
                };
            
            entry1.set('age',16);
            entry2.set('age',33);
            entry3.set('age',21);
            
            var testSet = [entry1, entry2, entry3];
            
            expect(calcMedian(testSet,ageAttr)).toEqual(23.333333333333332);
        });
        
        it('42.3 is a median for 81,43,3', function() {
            var entry1 = new Map(),
                entry2 = new Map(),
                entry3 = new Map(),
                ageAttr = {
                    name: 'age'
                };
            
            entry1.set('age',81);
            entry2.set('age',43);
            entry3.set('age',3);
            
            var testSet = [entry1, entry2, entry3];
            
            expect(calcMedian(testSet,ageAttr)).toEqual(42.333333333333336);
        });
        
        it('60 is a median for 17,62,101', function() {
            var entry1 = new Map(),
                entry2 = new Map(),
                entry3 = new Map(),
                ageAttr = {
                    name: 'age'
                };
            
            entry1.set('age',17);
            entry2.set('age',62);
            entry3.set('age',101);
            
            var testSet = [entry1, entry2, entry3];
            
            expect(calcMedian(testSet,ageAttr)).toEqual(60);
        });
        
    });
    
    describe('get most common class function', function() {
        goalAttributeName = 'class';
        classes = ['A','B'];
        
        
        it('should return A for [A,A,A,B]', function() {
            var entry1 = new Map(),
                entry2 = new Map(),
                entry3 = new Map(),
                entry4 = new Map();
            
            entry1.set('class','A');
            entry2.set('class','A');
            entry3.set('class','A');
            entry4.set('class','B');
            
            var testSet = new TreeNode();
            
            testSet.addEntry(entry1);
            testSet.addEntry(entry2);
            testSet.addEntry(entry3);
            testSet.addEntry(entry4);
            
            expect(getMostCommonClass(testSet)).toEqual('A');
        });
        
        it('should return B for [A,A,B,B,B]', function() {
            var entry1 = new Map(),
                entry2 = new Map(),
                entry3 = new Map(),
                entry4 = new Map(),
                entry5 = new Map();
            
            entry1.set('class','A');
            entry2.set('class','A');
            entry3.set('class','B');
            entry4.set('class','B');
            entry5.set('class','B');
            
            var testSet = new TreeNode();
            
            testSet.addEntry(entry1);
            testSet.addEntry(entry2);
            testSet.addEntry(entry3);
            testSet.addEntry(entry4);
            testSet.addEntry(entry5);
            
            expect(getMostCommonClass(testSet)).toEqual('B');
            
            classes = [];
            goalAttributeName = '';
        });
    });
    
    describe('split by continiuous attribute function', function() {      
        it('should split [24,45,67,43,22] into [24,22] and [45,67,43]', function() {
            var entry1 = new Map(),
                entry2 = new Map(),
                entry3 = new Map(),
                entry4 = new Map(),
                entry5 = new Map(),
                ageAttr = {
                    name: 'age'
                };
            
            entry1.set('age',24);
            entry2.set('age',45);
            entry3.set('age',67);
            entry4.set('age',43);
            entry5.set('age',22);
            
            var testSet = [entry1, entry2, entry3, entry4, entry5];
            
            var ans = splitByContiniousAttr(testSet,ageAttr);
            
            expect(ans.length).toEqual(2);
            
            expect(ans[0][0].get('age')).toEqual(24);
            expect(ans[0][1].get('age')).toEqual(22);
            expect(ans[1][0].get('age')).toEqual(45);
            expect(ans[1][1].get('age')).toEqual(67);
            expect(ans[1][2].get('age')).toEqual(43);       
        });
    });
    
    describe('split by discrete attr function', function() {
        it('should split [A,A,B,B] into [A,A] and [B,B]', function() {
            var entry1 = new Map(),
                entry2 = new Map(),
                entry3 = new Map(),
                entry4 = new Map(),
                pledgeAttr = {
                    name: 'pledge',
                    values: ['A','B']
                };
            
            entry1.set('pledge','A');
            entry2.set('pledge','A');
            entry3.set('pledge','B');
            entry4.set('pledge','B');
            
            var testSet = [entry1, entry2, entry3, entry4];
            
            var ans = splitSetByDiscreteAttr(testSet,pledgeAttr);
            
            expect(ans.length).toEqual(2);
            
            expect(ans[0][0].get('pledge')).toEqual('A');
            expect(ans[0][1].get('pledge')).toEqual('A');
            expect(ans[1][0].get('pledge')).toEqual('B');
            expect(ans[1][1].get('pledge')).toEqual('B');
        });
    });
};