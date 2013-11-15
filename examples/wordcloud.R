#!/usr/bin/env rscript

library(rjson)
library(optparse)

makeWordcloud <- function (words, filename) {
    # thanks to http://onertipaday.blogspot.co.uk/2011/07/word-cloud-in-r.html
    # although it does not really explain what happens here :-(
    require(tm)
    require(RColorBrewer)
    require(wordcloud)
    corpus <- Corpus(DataframeSource(data.frame(words)))
    tdm <- TermDocumentMatrix(corpus)
    m <- as.matrix(tdm)
    v <- sort(rowSums(m),decreasing=TRUE)
    d <- data.frame(word = names(v), freq = v)
    pal <- brewer.pal(8, "Dark2")
    png(filename, width = 1280, height = 800)
    topWordMagnification <- 8
    wordcloud(d$word, d$freq, scale = c(topWordMagnification, topWordMagnification / 8), min.freq = 2, max.words = 100, random.order = T, rot.per = .15, colors = pal)
    dev.off()
}

option_list <- list(
    make_option(c("-j", "--json")),
    make_option(c("-p", "--png"))
)
op <- OptionParser(usage = "usage: %prog --json <json file> --png <output image file>", option_list = option_list, add_help_option = TRUE, prog = NULL, description = "", epilogue = "")
args <- parse_args(op)
frequencies <- fromJSON(file = args[["json"]])
body <- Reduce(function (memo, x) { paste0(memo, paste(rep(x, frequencies[[x]]), collapse = " ", sep = " "), " ") }, names(frequencies), "")
makeWordcloud (body, args[["png"]])
