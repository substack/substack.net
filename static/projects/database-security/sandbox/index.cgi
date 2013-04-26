#!/usr/bin/env perl
use warnings;
use strict;

use CGI;
use CGI::Carp qw/fatalsToBrowser/;
use DBI;
use HTML::Entities qw/encode_entities/;

my $dbh = DBI->connect("dbi:SQLite:db.sqlite3", "", "", { RaiseError => 1});
my $cgi = CGI->new;
print $cgi->header;
print $cgi->Link({ rel => "StyleSheet", href => "style.css" });

my $sql = $cgi->param("sql") || "select * from planets";

print $cgi->h1(
        $cgi->a({ href => "http://en.wikipedia.org/wiki/SQL" }, "SQL"),
        "Sandbox"
    ),
    $cgi->start_form({ method => "POST", action => "." }),
        $cgi->textarea({
            name => "sql",
            default => $sql,
            cols => 80,
            rows => 10,
        }),
        $cgi->br,
        $cgi->submit("execute"),
    $cgi->end_form;

my $sth = $dbh->prepare($sql);
$sth->execute;
    
print $cgi->h1(encode_entities($sql)), $cgi->start_table;
my @cols = @{ $sth->{NAME_lc} || [] };
print $cgi->Tr(map $cgi->th($_), @cols);
while (my $row = $sth->fetchrow_hashref) {
    print $cgi->Tr(map $cgi->td($row->{$_}), @cols);
}
