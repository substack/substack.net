#!/usr/bin/env perl
use warnings;
use strict;

use CGI;
use CGI::Carp qw/fatalsToBrowser/;
use DBI;
use HTML::Entities qw/encode_entities/;

my $cgi = CGI->new;
print $cgi->header;

if (my $author = $cgi->param("author")) {
    my $dbh = DBI->connect("dbi:SQLite:db.sqlite3", "", "", { RaiseError => 1});

    # The unsafe way:
    my $sth = $dbh->prepare("select * from articles where author='$author'");
    $sth->execute;

    # The safe way:
    # my $sth = $dbh->prepare("select * from articles where author=?");
    # $sth->execute($author);

    while (my $row = $sth->fetchrow_hashref) {
        print $cgi->h1(encode_entities($row->{author})); 
        print encode_entities($row->{article});
    }
}
else {
    print
        $cgi->h1("Select an Author"),
        $cgi->a({ href=> "?author=Lemuel Gulliver" }, "Lemuel Gulliver"),
        $cgi->br,
        $cgi->a({ href=> "?author=Will Smith" }, "Will Smith");
}
