function compress(bitsIn, bitOut){
    var counts; //Counsts frequency of each character from the file
    printCounts(counts); //Prints counts for debug
    root = makeTreeFromCounts(counts); //Creates trie from counts
    printEncodingTree(root, 1); //Prints encoded tree for debug



}