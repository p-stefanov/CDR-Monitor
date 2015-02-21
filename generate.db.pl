use Meridian::Schema;
use Data::Random qw(:all);
use Math::Round 'nearest';
use Path::Class 'file';

use strict;
use warnings;

our $DB = shift || 'demo';

sub update_db {
	my $dn = (int rand 15) + 100;
	my $trunk = 'T00' . int rand 2;
	my $seconds = int rand 500 + 1;
	my $date = rand_datetime( min => '2014-12-1 4:0:0', max => 'now' );
	my $price = nearest( .01, rand 5);

	my $called = ''; $called .= int rand 9 for (1..8);
	my $db_fn = file($INC{'Meridian/Schema.pm'})->dir->parent->file("db/$DB.db");
		my $schema = Meridian::Schema->connect("dbi:SQLite:$db_fn");

	my $user = $schema->resultset('User')->find_or_new({
		dn => $dn,
	});
	$user->callscount($user->callscount + 1);
	$user->bill($user->bill + $price);
	$user->seconds($user->seconds + $seconds);
	$user->insert_or_update;

	$schema->resultset('Call')->create({
		dn      => $dn,
		trunk   => $trunk,
		seconds => $seconds,
		date    => $date,
		called  => $called,
		price   => $price,
		type    => (int rand 100) % 2 ? 'E' : 'T'
	});
}

system("sqlite3 db/$DB.db < db/init.sql") == 0 or die $!;

for (1..15) {
	update_db();
}
