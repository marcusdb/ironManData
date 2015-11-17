var casper = require('casper').create({
    verbose: true,
    logLevel: "error"
});


var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
//var alphabet = "a".split("");

var urls = [];
var athletes = [];


var getData = function getData() {
    var rowsArray = [];
    var rows = $('#eventResults tr');

    rows.each(function (index, value) {

        rowsArray.push(value);
    });

    rowsArray = Array.prototype.map.call(rows, function (row) {
        return $($(row).children('td')[1]).find('a').attr('href');

    });
    rowsArray.shift();//remove header
    //console.log(rowsArray.length);
    return rowsArray;
}

var getAthlete = function getAthlete() {
    var athlete = {};

    athlete.name = $('#mainContentCol4 h1').text();
    athlete.divRank = $('#rank').text();
    athlete.rank = $('#div-rank').text();
    athlete.bib = $('#general-info tr:eq(1) td:eq(1)').text();
    athlete.division = $('#general-info tr:eq(2) td:eq(1)').text();
    athlete.state = $('#general-info tr:eq(3) td:eq(1)').text();
    athlete.country = $('#general-info tr:eq(4) td:eq(1)').text();
    athlete.summary = {};
    athlete.summary.swim = $('#athelete-details tr:eq(1) td:eq(1)').text();
    athlete.summary.bike = $('#athelete-details tr:eq(2) td:eq(1)').text();
    athlete.summary.run = $('#athelete-details tr:eq(3) td:eq(1)').text();
    athlete.summary.overall =$('#athelete-details tr:eq(4) td:eq(1)').text();
    //////swim
    athlete.swim = {
        total: {
            distance: $('.athlete-table-details table:eq(0) tr:eq(1) td:eq(1)').text(),
            split: $('.athlete-table-details table:eq(0) tr:eq(1) td:eq(2)').text(),
            time: $('.athlete-table-details table:eq(0) tr:eq(1) td:eq(3)').text(),
            pace: $('.athlete-table-details table:eq(0) tr:eq(1) td:eq(4)').text(),
            divRank: $('.athlete-table-details table:eq(0) tr:eq(1) td:eq(5)').text(),
            genderRank: $('.athlete-table-details table:eq(0) tr:eq(1) td:eq(6)').text(),
            overallRank: $('.athlete-table-details table:eq(0) tr:eq(1) td:eq(7)').text()
        }
    };
    //////bike
    athlete.bike = {};
    athlete.bike.split = [];
    $('.athlete-table-details table:eq(1) tbody tr').each(function (index, el) {
        athlete.bike.split.push({
            name: el.children[0].innerHTML,
            distance: el.children[1].innerHTML,
            splitTime: el.children[2].innerHTML,
            raceTime: el.children[3].innerHTML,
            pace: el.children[4].innerHTML
        });
    });

    athlete.bike.total = {
        distance: $('.athlete-table-details table:eq(1) tfoot tr:eq(1) td:eq(1)').text(),
        splitTime: $('.athlete-table-details table:eq(1) tfoot tr:eq(1) td:eq(2)').text(),
        raceTime: $('.athlete-table-details table:eq(1) tfoot tr:eq(1) td:eq(3)').text(),
        pace: $('.athlete-table-details table:eq(1) tfoot tr:eq(1) td:eq(4)').text(),
        divRank: $('.athlete-table-details table:eq(0) tfoot tr:eq(1) td:eq(5)').text(),
        genderRank: $('.athlete-table-details table:eq(0) tfoot tr:eq(1) td:eq(6)').text(),
        overallRank: $('.athlete-table-details table:eq(0) tfoot tr:eq(1) td:eq(7)').text()
    };
    //////run
    athlete.run = {};
    athlete.run.split = [];
    $('.athlete-table-details table:eq(2) tbody tr').each(function (index, el) {
        athlete.run.split.push({
            name: el.children[0].innerHTML,
            distance: el.children[1].innerHTML,
            splitTime: el.children[2].innerHTML,
            raceTime: el.children[3].innerHTML,
            pace: el.children[4].innerHTML
        });
    });

    athlete.run.total = {
        distance: $('.athlete-table-details table:eq(2) tfoot tr:eq(1) td:eq(1)').text(),
        splitTime: $('.athlete-table-details table:eq(2) tfoot tr:eq(1) td:eq(2)').text(),
        raceTime: $('.athlete-table-details table:eq(2) tfoot tr:eq(1) td:eq(3)').text(),
        pace: $('.athlete-table-details table:eq(2) tfoot tr:eq(1) td:eq(4)').text(),
        divRank: $('.athlete-table-details table:eq(2) tfoot tr:eq(1) td:eq(5)').text(),
        genderRank: $('.athlete-table-details table:eq(2) tfoot tr:eq(1) td:eq(6)').text(),
        overallRank: $('.athlete-table-details table:eq(2) tfoot tr:eq(1) td:eq(7)').text()
    };

    athlete.t1=$('.athlete-table-details table:eq(3)  tr:eq(0) td:eq(1)').text();
    athlete.t2=$('.athlete-table-details table:eq(3)  tr:eq(1) td:eq(1)').text();

    return athlete;
}

//casper.on('remote.message', function (message) {
//    this.echo(message);
//});

var timeout = function timeout() { // step to execute if check has failed
    this.echo('Failed to navigate to page 2', 'ERROR');
};

var fetchLinks = function fetchLinks(i, casper) {
    casper.page.close();
    casper.page = require('webpage').create();
    casper.open('http://track.ironman.com/newsearch.php?y=2015&race=fortaleza&v=3.0&letter=' + alphabet[i]).then(function then() {
        //this.echo(this.getCurrentUrl());
        urls = urls.concat(casper.evaluate(getData));
        i = i + 1;
        if (i < alphabet.length) {
            fetchLinks(i, this);
        }
    });
};

var fetchAthletes = function fetchAthletes(i, casper) {
    casper.page.close();
    casper.page = require('webpage').create();
    casper.open('http://track.ironman.com/'+urls[i]).then(function then() {
        //this.echo(JSON.stringify(casper.evaluate(getAthlete), null, '\t'));
        athletes.push(casper.evaluate(getAthlete));
        i = i + 1;
        if (i < urls.length) {
            fetchAthletes(i, this);
        }
    });

}


casper.start();
casper.then(function () {
    fetchLinks(0, this);
});

casper.then(function () {
    fetchAthletes(0, this);
});


casper.run(function () {
    this.echo(JSON.stringify(athletes));
    this.exit();
});