import csv
import os
import datetime
from huttustutka.scrape_huttunen import ScrapeHuttunen

STATISTICS_FILE = 'static/huttusstatistics.csv'
DELIMITER = ','


def count_average(amount):
    try:
        return int(amount)
    except ValueError:
        pass

    return sum([int(value) for value in amount.split('-')]) / 2


def skip_statistics(filepath):
    if not os.path.isfile(filepath):
        return False

    with open(filepath, 'r') as csvfile:
        lines = csvfile.readlines()
        if not lines:
            return False

        last_date = lines[-1].split(DELIMITER)[1]
        if datetime.datetime.strptime(last_date, '%Y-%m-%d').date() == datetime.date.today():
            return True

        return False


def run_statistics(filepath):
    if skip_statistics(filepath):
        return

    scraper = ScrapeHuttunen()
    huttuset = scraper.how_much_huttunen()

    with open(filepath, 'a') as csvfile:
        csvwriter = csv.writer(csvfile, delimiter=DELIMITER)

        for store in huttuset:
            csvwriter.writerow([
                store['id'],
                datetime.date.today(),
                count_average(store['amount'])
            ])


if __name__ == '__main__':
    run_statistics(STATISTICS_FILE)