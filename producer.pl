#! /usr/bin/env perl
use AnyEvent;

use strict;
use warnings;

$|++;

my $cv = AnyEvent->condvar;
my $timer = AnyEvent->timer (after => 1, interval => int rand 10, cb => \&emit);

sub emit {
	my $caller = (int rand 15) + 100;
	my $callee = ''; $callee .= int rand 9 for (1..8);
	my $date = localtime;
	my $seconds = int rand 500 + 1;
    my $price = ($seconds / 60) * 0.2;
    $price = sprintf("%.2f", $price); # round
	print "$caller called $callee on $date for $seconds s. costing $price\n";
}

$cv->recv;
