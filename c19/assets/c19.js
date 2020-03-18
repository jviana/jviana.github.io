/* global moment */
/* global google */
class C19 {
    constructor () {
        this.totalPT = 0;
        this.totalDeceasedPT = 0;
        this.totalRecoveredPT = 0;
        this.percentage = {
            totalPT: 0,
            totalDeceasedPT: 0,
            totalRecoveredPT: 0
        };
        this.maxPT = 0;
        this.minPT = 0;
        // Create Set
        this.months = new Set();
        this.flags = {
            monthsRendered: false
        };
        this.dataURL = 'https://jviana.github.io/c19/data/c19.json?v=' + Math.floor(Math.random() * (1000 - 1 + 1) + 1);
        this.totalVariation = {
            up: 'trending_up',
            down: 'trending_down',
            equal: '='
        };
        /* google.charts.load('current', {
            callback: this.drawChart,
            packages: ['corechart']
        }); */
        /* google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart); */
        this.valuesForChart1 = [];
        this.chartContainers = {
            chart1: 'chart_absolute_daily_value'
        };
        this.chart1Rendered = false;
        this.infoCardActive = 'confirmed';
    };

    animateNumericValue2 (elem, start, end, duration, decimalDigits, aditionalCharacter = '') {
        const obj = $('#' + elem);
        const step = ts => {
            if (!start) {
                start = ts;
            }
            const progress = (ts - start) / duration;
            let intermediateValue;
            if (decimalDigits === 0) {
                intermediateValue = Math.floor(progress * end);
                if (intermediateValue <= end) {
                    obj.html(intermediateValue + aditionalCharacter);
                } else {
                    obj.html(end);
                }
            } else {
                intermediateValue = progress * end;
                if (intermediateValue <= end) {
                    obj.html(intermediateValue.toFixed(2) + aditionalCharacter);
                } else {
                    obj.html(end.toFixed(2) + aditionalCharacter);
                }
            }
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }

    animateNumericValue (elem, start, end, duration, decimalDigits) {
        const range = end - start;
        const obj = $('#' + elem);
        let increment;
        let stepTime;
        if (decimalDigits === 0) {
            increment = end > start ? 1 : -1;
            stepTime = Math.abs(Math.floor(duration / range));
        } else {
            increment = 1 / Math.pow(10, decimalDigits);
            end = end.toFixed(2);
            stepTime = 0;
        }

        let current;
        let timer;
        current = start;
        obj.html(current);
        if (start === end) {
            obj.html(current);
        } else {
            timer = setInterval(function () {
                if (decimalDigits > 0) {
                    current = current + increment;
                    obj.html(current.toFixed(2) + '%');
                    if (current.toFixed(2) === end) {
                        clearInterval(timer);
                    }
                } else {
                    current += increment;
                    obj.html(current);
                    if (current === end) {
                        clearInterval(timer);
                    }
                }
            }, stepTime);
        }
    }

    getPercentage (total, value) {
        const percentage = value / total * 100;
        return percentage;
    }

    displayTotalConfirmed () {
        // STATIC
        // $('#totalConfirmed').html(this.totalPT);
        // $('#totalConfirmedDeceased').html(this.totalDeceasedPT);
        // $('#totalRecovered').html(this.totalRecoveredPT);
        // ANIMATED
        const duration = 500;
        this.animateNumericValue2('totalConfirmed', 0, this.totalPT, duration, 0);
        this.animateNumericValue2('totalRecovered', 0, this.totalRecoveredPT, duration, 0);
        this.animateNumericValue2('totalDeceased', 0, this.totalDeceasedPT, duration, 0);
        // percentage
        this.animateNumericValue2('totalRecoveredPercentage', 0, this.percentage.totalRecoveredPT, duration, 2, '%');
        this.animateNumericValue2('totalDeceasedPercentage', 0, this.percentage.totalDeceasedPT, duration, 2, '%');
        // total situation (to trending icon)
        let variationIcon;
        let variationIconClass;
        const allBars = $('div#main-content-bars').find('.progress-bar');
        const lastBarRendered = $('div#main-content-bars').find('.progress-bar:last');
        const nBars = Object.keys(allBars).length - 2 - 1;
        const lastButOneBarRendered = allBars[nBars - 1];
        const lastValue = parseInt(lastBarRendered.attr('data-cases'));
        const lastButOneValue = parseInt($(lastButOneBarRendered).attr('data-cases'));
        if (lastValue > lastButOneValue) {
            variationIcon = this.totalVariation.up;
            variationIconClass = 'text-danger';
        } else if (lastValue < lastButOneValue) {
            variationIcon = this.totalVariation.down;
            variationIconClass = 'text-success';
        } else {
            variationIcon = this.totalVariation.equal;
            variationIconClass = 'text-muted';
        }
        $('#totalConfirmedSituation > i').addClass(variationIconClass);
        $('#totalConfirmedSituation > i').html(variationIcon);
        /* const totalTrendingPercentage = (lastValue - lastButOneValue) / lastButOneValue * 100;
        $('#totalTrendingPercentage').addClass(variationIconClass);
        $('#totalTrendingPercentage').html(totalTrendingPercentage.toFixed(2) + '%'); */
    }

    getVariation (lastValue, lastButOneValue) {
        let variation;
        if (lastButOneValue !== 0) {
            variation = (lastValue - lastButOneValue) / lastButOneValue * 100;
        } else {
            if (lastValue === 0) {
                variation = 0;
            } else {
                variation = 0;
            }
        }
        return variation;
    }

    setLayoutTweaks () {
        const todayDateNumeric = moment().format('YYYYMMDD');
        const barsmax = $('div#main-content-bars').find('div.progress-bar[data-ismax="1"]');
        const barsmin = $('div#main-content-bars').find('div.progress-bar[data-ismin="1"]');
        const currentDayBar = $('div#main-content-bars').find('div.row-day[data-date="' + todayDateNumeric + '"]').find('div.progress-bar');
        if (this.infoCardActive === 'confirmed') {
            $.each(barsmax, function (i, bar) {
                $(bar).removeClass('bg-info').addClass('bg-danger');
                $(bar).parent().parent().prev().addClass('text-danger');
            });
            $.each(barsmin, function (i, bar) {
                $(bar).removeClass('bg-info').addClass('bg-success');
                $(bar).parent().parent().prev().addClass('text-success');
            });
        }
        // present day (animation)
        currentDayBar.addClass('progress-bar-striped progress-bar-animated');
        $('#' + this.chartContainers.chart1).removeClass('d-none');
    }

    setFooter (source, lastDate) {
        const lastSourceContainer = $('#lastsource');
        const lastUpdateContainer = $('#lastupdate');
        lastSourceContainer.html(`<a href="${source.lastURL}" class="text-info" target="_blank">${source.lastDescription}</a>`);
        lastUpdateContainer.html(lastDate.format('DD-MM-YYYY'));
    }

    resetInfo () {
        const self = this;
        const infoCards = $('.info-cards div.card');
        if (!this.flags.monthsRendered) {
            $('div#main-content-months').find('button').slice(1).remove();
        }
        $('div#main-content-bars').find('div.row-day').slice(1).remove();
        $('#' + this.chartContainers.chart1).addClass('d-none');
        // reset info cards
        $.each(infoCards, function (i, card) {
            card = $(card);
            card.removeClass('info-card-active');
            if (card.attr('data-type') === self.infoCardActive) {
                card.addClass('info-card-active');
            }
        });
    }

    setMonths () {
        const self = this;
        const months = [...this.months];
        let content;
        $.each(months, function (i, m) {
            content = $('div#month-template').html();
            content = content.replace(/{{month}}/g, m);
            $('div#main-content-months').append(`${content}`);
            $('.btn-month').unbind('click');
            $('.btn-month').click(function (event) {
                event.preventDefault();
                self.resetInfo();
                self.getData();
            });
        });
        this.flags.monthsRendered = true;
    }

    setBars (globalInfo) {
        const self = this;
        const data = globalInfo.results;
        let barContent;
        let lastValue;
        let lastButOneValue;
        // Total =======
        this.totalPT = data.reduce((acc, d) => acc + d.ptConfirmed, 0);
        this.totalRecoveredPT = data.reduce((acc, d) => acc + d.ptRecovered, 0);
        this.totalDeceasedPT = data.reduce((acc, d) => acc + d.ptDeceased, 0);
        // Percentage ==
        this.percentage.totalRecoveredPT = this.getPercentage(this.totalPT, this.totalRecoveredPT);
        this.percentage.totalDeceasedPT = this.getPercentage(this.totalPT, this.totalDeceasedPT);
        this.maxPT = Math.max.apply(Math, data.map(d => d.ptConfirmed));
        this.minPT = Math.min.apply(Math, data.map(d => d.ptConfirmed));
        let lastDate;
        let lastBarRendered;
        let dayVariation;
        let dayVariationNum;
        let dayVariationClass;
        lastValue = 0;
        lastButOneValue = 0;
        // Reset info for charts
        this.valuesForChart1 = [];
        // Reset info for charts (end)
        moment.locale('pt');
        $.each(data, function (i, d) {
            const date = moment(d.date, 'YYYYMMDD');
            const day = date.format('D');
            const month = date.format('MMMM');
            const ptConfirmed = d.ptConfirmed;
            const ptRecovered = d.ptRecovered;
            const ptDeceased = d.ptDeceased;
            const ismax = (ptConfirmed === self.maxPT) ? 1 : 0;
            const ismin = (ptConfirmed === self.minPT) ? 1 : 0;
            // dates
            const dateNumeric = {
                full: date.format('YYYYMMDD'),
                month: date.format('MM'),
                forChart1: date.format('DD.MMM')
            };
            let valueActiveToBars;
            let cssBar;
            // INFO TO DISPLAY IN BARS
            switch (self.infoCardActive) {
            case 'confirmed':
                valueActiveToBars = ptConfirmed;
                cssBar = 'bg-info';
                break;
            case 'recovered':
                valueActiveToBars = ptRecovered;
                cssBar = 'bg-success';
                break;
            case 'deceased':
                valueActiveToBars = ptDeceased;
                cssBar = 'bg-secondary';
                break;
            }
            // INFO TO DISPLAY IN BARS (end)
            lastButOneValue = lastValue;
            lastValue += valueActiveToBars;
            dayVariation = dayVariationNum = self.getVariation(lastValue, lastButOneValue);
            dayVariation = dayVariation.toFixed(1) + '%';
            if (dayVariationNum > 0) {
                dayVariation = '+' + dayVariation;
                dayVariationClass = 'text-danger';
            } else if (dayVariationNum < 0) {
                dayVariationClass = 'text-success';
            } else {
                dayVariationClass = 'text-muted';
            }
            // adjust css to view
            if (self.infoCardActive === 'recovered') {
                if (dayVariationNum > 0) {
                    dayVariationClass = 'text-success';
                } else {
                    dayVariationClass = 'text-muted';
                }
            }
            if (self.infoCardActive === 'deceased') {
                if (dayVariationNum > 0) {
                    dayVariationClass = 'text-secondary';
                } else {
                    dayVariationClass = 'text-muted';
                }
            }
            // adjust css to view (end)
            self.valuesForChart1.push([dateNumeric.forChart1, ptConfirmed, ptRecovered, ptDeceased]);
            // ------------------------------
            self.months.add(month);
            barContent = $('div#day-template').html();
            barContent = barContent.replace(/{{date}}/g, day);
            barContent = barContent.replace(/{{cssBar}}/g, cssBar);
            barContent = barContent.replace(/{{cases}}/g, ptConfirmed);
            barContent = barContent.replace(/{{ptConfirmed}}/g, valueActiveToBars);
            barContent = barContent.replace(/{{dayVariation}}/g, dayVariation);
            barContent = barContent.replace(/{{dayVariationClass}}/g, dayVariationClass);
            barContent = barContent.replace(/{{percentage}}/g, self.getPercentage(self.maxPT, valueActiveToBars));
            barContent = barContent.replace(/{{ismax}}/g, ismax);
            barContent = barContent.replace(/{{ismin}}/g, ismin);
            barContent = barContent.replace(/{{datenum}}/g, dateNumeric.full);
            barContent = barContent.replace(/{{monthnum}}/g, dateNumeric.month);
            $('div#main-content-bars').append(`${barContent}`);
            lastBarRendered = $('div#main-content-bars').find('.progress-bar:last');
            lastBarRendered.css('width', '0%');
            lastBarRendered.css('width', self.getPercentage(self.maxPT, valueActiveToBars) + '%');
            // adjust text (ptConfirmed)
            if (valueActiveToBars <= 2) {
                lastBarRendered.addClass('text-dark');
            }
            /* if (valueActiveToBars === 1) {
                lastBarRendered.addClass('pl-2');
            } else if (valueActiveToBars === 2) {
                lastBarRendered.addClass('pl-3');
            } */
            // adjust text (ptConfirmed) --END
            lastDate = date;
        });
        this.displayTotalConfirmed();
        this.setInfoCardsEvents();
        if (!this.flags.monthsRendered) {
            this.setMonths();
        }
        this.setFooter(globalInfo.sources, lastDate);
        setTimeout(() => self.setLayoutTweaks(), 1000);
        if (!this.chart1Rendered) {
            google.charts.load('current', {
                callback: this.drawChart,
                packages: ['corechart']
            });
            this.chart1Rendered = true;
        }
    }

    setInfoCardsEvents () {
        const self = this;
        const infoCards = $('.info-cards div.card');
        infoCards.unbind('click');
        infoCards.click(function (event) {
            self.infoCardActive = $(this).attr('data-type');
            event.preventDefault();
            self.resetInfo();
            self.getData();
        });
    }

    getData () {
        const self = this;
        fetch(this.dataURL)
            .then(response => response.json())
            .then(data => {
                self.setBars(data);
            })
            .catch(error => console.error(error));
    }

    drawChart () {
        $('chart_absolute_daily_value').html('');
        const data = new google.visualization.DataTable();
        const chart = new google.visualization.LineChart(document.getElementById('chart_absolute_daily_value'));
        data.addColumn('string', 'Dia');
        data.addColumn('number', 'Confirmados');
        data.addColumn('number', 'Recuperados');
        data.addColumn('number', 'Óbitos');
        data.addRows(c19.valuesForChart1);
        const options = {
            title: 'Evolução diária',
            titleTextStyle: {
                color: '#455564',
                fontSize: 14,
                fontName: 'Open Sans Condensed',
                bold: true,
                italic: false
            },
            width: '100%',
            colors: ['#17a2b8', '#28a745', '#6c757d'],
            legend: {
                position: 'bottom',
                textStyle: {
                    color: '#6c7587',
                    fontSize: 12,
                    fontName: 'Open Sans Condensed',
                    bold: false,
                    italic: false
                }
            },
            backgroundColor: 'transparent',
            hAxis: {
                textStyle: {
                    color: '#6c7587',
                    fontSize: 11,
                    fontName: 'Open Sans Condensed',
                    bold: false,
                    italic: false
                }
            },
            vAxis: {
                textStyle: {
                    color: '#6c7587',
                    fontSize: 11,
                    fontName: 'Open Sans Condensed',
                    bold: false,
                    italic: false
                }
            }
        };

        chart.draw(data, options);
    }
}
const c19 = new C19();
c19.getData();
