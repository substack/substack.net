#!/usr/bin/env perl
use warnings;
use strict;

use CGI;
use CGI::Carp qw/fatalsToBrowser/;
use DBI;
use HTML::Entities qw/encode_entities/;

my $cgi = CGI->new;
print $cgi->header;

my $dbh = DBI->connect("dbi:SQLite:db.sqlite3", "", "", { RaiseError => 1});

if (my $quote_id = $cgi->param("quote_id")) {
    my $sth = $dbh->prepare("select * from quotes where id=$quote_id");
    $sth->execute;
    
    while (my $row = $sth->fetchrow_hashref) {
        print $cgi->h1(encode_entities($row->{author})); 
        print encode_entities($row->{quote});
    }
    
    if ($sth->rows == 0) {
        print $cgi->h1("No such quote.");
    }
}
else {
    print $cgi->h1("Quotes"),
        $cgi->a({ href => "?quote_id=1" }, "Bertrand Russel"),
            $cgi->br,
        $cgi->a({ href => "?quote_id=5" }, "Larry Wall"),
            $cgi->br,
        $cgi->a({ href => "?quote_id=8" }, "Edsger Dijkstra"),
            $cgi->br;
}
