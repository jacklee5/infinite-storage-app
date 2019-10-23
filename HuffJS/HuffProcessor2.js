function frequency(str){
    var freqs = {};
    for (var i = 0; i<=str.length;i++){
        if (str[i] in freqs){
            freqs[str[i]] ++;
        }
        else{
            freqs[str[i]] = 1;
        }
    } 
}

function sortfreq(freqs){
    var letters = [];
    for (var ch in freqs){
        letters.push([freqs[ch],ch]);
    }
    return letters.sort();

}
//console.log(sortfreq({'a': 3, 'c': 2, 'b': 1, 'e': 5, 'd': 1, 'g': 1, 'f': 2}));


function buildtree(letters){
    while(letters.length>1){
        var leasttwo = letters.slice(0,2);
        var therest = letters.slice(2,letters.length);
        var combfreq = letters[0][0] + letters[1][0];
        letters = therest;
        //console.log(letters);
        var two = [combfreq,leasttwo];
        letters.push(two);
        //console.log(letters);
        letters.sort();
    }
    return letters[0];
}

function trimtree(tree){
    var p = tree[1];
    if (typeof p === 'string'){
        return p;
    }else{
        return (Array(trimtree(p[0]),trimtree(p[1])));
    }
}

var tree = buildtree(sortfreq(frequency("banana")));

node = (trimtree(tree));
console.log(node);

var codes = {}; 
function assigncodes(node,pat){
    pat = pat || "";
    if(typeof(node) == typeof("")){
        codes[node] = pat;
    }
    else{
        assigncodes(node[0],pat+"0");
        assigncodes(node[1],pat+"1");
    }
    return codes;
}
console.log(assigncodes(node));

function encode(str){
    var output = "";
    for (var i=0;i<str.length;i++){
        output = output+codes[str[i]];
    }
    return output;
}

function decode(tree,str){
    var output="";
    var p=tree;
    for (var i=0;i<str.length;i++){
        if(str[i] == '0'){
            p=p[0];
        }else{
            p=p[1];
        }

        if (typeof p === 'string'){
            output = output +p;
            p=tree;
        }
    }
    return  output;
}
console.log(decode(trimtree(tree),l));