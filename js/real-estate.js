// Texas MLS Real Estate Investment Analysis Tool
(function () {
    'use strict';

    // Simulated Texas MLS property data
    // In production, this would connect to NTREIS, HAR, SABOR, ACTRIS APIs
    const mlsListings = [
        {
            address: "4217 Cedar Springs Rd",
            market: "dfw",
            marketLabel: "Dallas-Fort Worth",
            price: 285000,
            sqft: 2400,
            units: 2,
            yearBuilt: 1978,
            estimatedRepairs: 8500,
            projectedRent: 3200,
            neighborhoodScore: 78,
            appreciation3yr: 14.2
        },
        {
            address: "1823 Harrisburg Blvd",
            market: "houston",
            marketLabel: "Houston",
            price: 320000,
            sqft: 3100,
            units: 4,
            yearBuilt: 1982,
            estimatedRepairs: 12000,
            projectedRent: 4800,
            neighborhoodScore: 65,
            appreciation3yr: 9.8
        },
        {
            address: "502 S Flores St",
            market: "sanantonio",
            marketLabel: "San Antonio",
            price: 245000,
            sqft: 2200,
            units: 3,
            yearBuilt: 1975,
            estimatedRepairs: 6500,
            projectedRent: 3600,
            neighborhoodScore: 72,
            appreciation3yr: 11.5
        },
        {
            address: "8901 N Lamar Blvd",
            market: "austin",
            marketLabel: "Austin",
            price: 425000,
            sqft: 2800,
            units: 2,
            yearBuilt: 1985,
            estimatedRepairs: 14000,
            projectedRent: 4200,
            neighborhoodScore: 85,
            appreciation3yr: 8.3
        },
        {
            address: "3314 Montana Ave",
            market: "elpaso",
            marketLabel: "El Paso",
            price: 195000,
            sqft: 2100,
            units: 3,
            yearBuilt: 1970,
            estimatedRepairs: 9000,
            projectedRent: 2850,
            neighborhoodScore: 61,
            appreciation3yr: 12.7
        },
        {
            address: "1205 E Business 83",
            market: "rgv",
            marketLabel: "Rio Grande Valley",
            price: 175000,
            sqft: 1900,
            units: 4,
            yearBuilt: 1988,
            estimatedRepairs: 5000,
            projectedRent: 3200,
            neighborhoodScore: 55,
            appreciation3yr: 15.1
        },
        {
            address: "6742 Greenville Ave",
            market: "dfw",
            marketLabel: "Dallas-Fort Worth",
            price: 340000,
            sqft: 2800,
            units: 4,
            yearBuilt: 1980,
            estimatedRepairs: 11000,
            projectedRent: 5200,
            neighborhoodScore: 82,
            appreciation3yr: 13.1
        },
        {
            address: "901 Westheimer Rd",
            market: "houston",
            marketLabel: "Houston",
            price: 298000,
            sqft: 2600,
            units: 3,
            yearBuilt: 1976,
            estimatedRepairs: 7500,
            projectedRent: 4100,
            neighborhoodScore: 74,
            appreciation3yr: 10.4
        },
        {
            address: "2445 Vance Jackson Rd",
            market: "sanantonio",
            marketLabel: "San Antonio",
            price: 210000,
            sqft: 1850,
            units: 2,
            yearBuilt: 1972,
            estimatedRepairs: 4500,
            projectedRent: 2600,
            neighborhoodScore: 68,
            appreciation3yr: 13.8
        },
        {
            address: "715 E 51st St",
            market: "austin",
            marketLabel: "Austin",
            price: 380000,
            sqft: 2400,
            units: 3,
            yearBuilt: 1968,
            estimatedRepairs: 15000,
            projectedRent: 4500,
            neighborhoodScore: 79,
            appreciation3yr: 7.2
        },
        {
            address: "4501 N Mesa St",
            market: "elpaso",
            marketLabel: "El Paso",
            price: 165000,
            sqft: 1700,
            units: 2,
            yearBuilt: 1974,
            estimatedRepairs: 3500,
            projectedRent: 2200,
            neighborhoodScore: 59,
            appreciation3yr: 11.9
        },
        {
            address: "2103 S Padre Island Dr",
            market: "corpus",
            marketLabel: "Corpus Christi",
            price: 225000,
            sqft: 2050,
            units: 3,
            yearBuilt: 1981,
            estimatedRepairs: 8000,
            projectedRent: 3100,
            neighborhoodScore: 62,
            appreciation3yr: 10.1
        },
        {
            address: "810 University Ave",
            market: "lubbock",
            marketLabel: "Lubbock",
            price: 185000,
            sqft: 2000,
            units: 4,
            yearBuilt: 1969,
            estimatedRepairs: 7000,
            projectedRent: 3400,
            neighborhoodScore: 64,
            appreciation3yr: 9.5
        },
        {
            address: "1520 W Davis St",
            market: "dfw",
            marketLabel: "Dallas-Fort Worth",
            price: 265000,
            sqft: 2200,
            units: 3,
            yearBuilt: 1973,
            estimatedRepairs: 10000,
            projectedRent: 3800,
            neighborhoodScore: 71,
            appreciation3yr: 16.2
        },
        {
            address: "3802 Lyons Ave",
            market: "houston",
            marketLabel: "Houston",
            price: 248000,
            sqft: 2300,
            units: 4,
            yearBuilt: 1965,
            estimatedRepairs: 13000,
            projectedRent: 4400,
            neighborhoodScore: 58,
            appreciation3yr: 18.5
        },
        {
            address: "927 Nogalitos St",
            market: "sanantonio",
            marketLabel: "San Antonio",
            price: 199000,
            sqft: 1750,
            units: 2,
            yearBuilt: 1971,
            estimatedRepairs: 5500,
            projectedRent: 2400,
            neighborhoodScore: 66,
            appreciation3yr: 12.3
        },
        {
            address: "5612 Manor Rd",
            market: "austin",
            marketLabel: "Austin",
            price: 465000,
            sqft: 3200,
            units: 4,
            yearBuilt: 1979,
            estimatedRepairs: 11000,
            projectedRent: 5800,
            neighborhoodScore: 81,
            appreciation3yr: 6.8
        },
        {
            address: "2201 N Piedras St",
            market: "elpaso",
            marketLabel: "El Paso",
            price: 145000,
            sqft: 1500,
            units: 2,
            yearBuilt: 1966,
            estimatedRepairs: 6000,
            projectedRent: 1900,
            neighborhoodScore: 52,
            appreciation3yr: 10.8
        },
        {
            address: "304 E Nolana Ave",
            market: "rgv",
            marketLabel: "Rio Grande Valley",
            price: 198000,
            sqft: 2200,
            units: 5,
            yearBuilt: 1984,
            estimatedRepairs: 9500,
            projectedRent: 4100,
            neighborhoodScore: 57,
            appreciation3yr: 14.6
        },
        {
            address: "1108 Indiana Ave",
            market: "lubbock",
            marketLabel: "Lubbock",
            price: 155000,
            sqft: 1800,
            units: 3,
            yearBuilt: 1972,
            estimatedRepairs: 4000,
            projectedRent: 2700,
            neighborhoodScore: 63,
            appreciation3yr: 8.9
        }
    ];

    // Calculate Cash-on-Cash return
    function calculateCoC(listing) {
        var downPayment = listing.price * 0.25;
        var closingCosts = listing.price * 0.03;
        var totalInvestment = downPayment + closingCosts + listing.estimatedRepairs;

        var annualRent = listing.projectedRent * 12;
        var vacancy = annualRent * 0.08;
        var taxes = listing.price * 0.022; // Texas avg property tax
        var insurance = listing.price * 0.005;
        var maintenance = annualRent * 0.10;
        var operatingExpenses = vacancy + taxes + insurance + maintenance;

        var loanAmount = listing.price * 0.75;
        var monthlyRate = 0.0695 / 12; // Current ~6.95% rate
        var payments = 360;
        var monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
        var annualDebt = monthlyPayment * 12;

        var noi = annualRent - operatingExpenses;
        var cashFlow = noi - annualDebt;
        var coc = (cashFlow / totalInvestment) * 100;

        return Math.round(coc * 10) / 10;
    }

    // Calculate investment grade
    function calculateGrade(listing, coc) {
        var score = 0;
        var priceSqft = listing.price / listing.sqft;

        // Cost per sqft (lower is better)
        if (priceSqft < 100) score += 3;
        else if (priceSqft < 130) score += 2;
        else if (priceSqft < 160) score += 1;

        // Neighborhood score
        if (listing.neighborhoodScore >= 75) score += 3;
        else if (listing.neighborhoodScore >= 60) score += 2;
        else if (listing.neighborhoodScore >= 50) score += 1;

        // Repairs (lower is better)
        if (listing.estimatedRepairs < 5000) score += 3;
        else if (listing.estimatedRepairs < 10000) score += 2;
        else if (listing.estimatedRepairs < 15000) score += 1;

        // CoC return
        if (coc >= 12) score += 3;
        else if (coc >= 8) score += 2;
        else if (coc >= 5) score += 1;

        // Units (more units = more income density)
        if (listing.units >= 4) score += 3;
        else if (listing.units >= 3) score += 2;
        else if (listing.units >= 2) score += 1;

        if (score >= 12) return 'A';
        if (score >= 8) return 'B';
        return 'C';
    }

    // Get score bar color
    function getScoreColor(score) {
        if (score >= 75) return '#10b981';
        if (score >= 60) return '#2740fc';
        return '#f59e0b';
    }

    // Format currency
    function formatCurrency(amount) {
        return '$' + amount.toLocaleString();
    }

    // Render results
    function renderResults(listings) {
        var resultsSection = document.getElementById('results-section');
        var resultsBody = document.getElementById('results-body');
        var resultsCount = document.getElementById('results-count');

        resultsBody.innerHTML = '';

        if (listings.length === 0) {
            resultsBody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#6b7280;">No properties match your criteria. Try adjusting filters.</td></tr>';
            resultsCount.textContent = '0 results';
            resultsSection.classList.add('visible');
            return;
        }

        resultsCount.textContent = listings.length + ' properties found';

        listings.forEach(function (listing) {
            var coc = calculateCoC(listing);
            var grade = calculateGrade(listing, coc);
            var priceSqft = Math.round(listing.price / listing.sqft);
            var scoreColor = getScoreColor(listing.neighborhoodScore);

            var gradeClass = 'grade-' + grade.toLowerCase();

            var row = document.createElement('tr');
            row.innerHTML =
                '<td><strong>' + listing.address + '</strong></td>' +
                '<td>' + listing.marketLabel + '</td>' +
                '<td>' + formatCurrency(listing.price) + '</td>' +
                '<td>$' + priceSqft + '</td>' +
                '<td>' + listing.units + '</td>' +
                '<td>' + formatCurrency(listing.estimatedRepairs) + '</td>' +
                '<td><strong>' + coc + '%</strong></td>' +
                '<td><span class="neighborhood-score">' + listing.neighborhoodScore + '/100 <span class="score-bar"><span class="score-bar-fill" style="width:' + listing.neighborhoodScore + '%;background:' + scoreColor + '"></span></span></span></td>' +
                '<td><span class="' + gradeClass + '">' + grade + '</span></td>';

            resultsBody.appendChild(row);
        });

        resultsSection.classList.add('visible');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Filter listings based on user criteria
    function filterListings() {
        var market = document.getElementById('filter-market').value;
        var maxPrice = parseInt(document.getElementById('filter-maxprice').value);
        var maxSqft = parseInt(document.getElementById('filter-sqft').value);
        var minUnits = parseInt(document.getElementById('filter-units').value);
        var maxRepair = parseInt(document.getElementById('filter-repair').value);
        var minRoi = parseInt(document.getElementById('filter-roi').value);

        var filtered = mlsListings.filter(function (listing) {
            if (market !== 'all' && listing.market !== market) return false;
            if (listing.price > maxPrice) return false;
            if ((listing.price / listing.sqft) > maxSqft) return false;
            if (listing.units < minUnits) return false;
            if (listing.estimatedRepairs > maxRepair) return false;

            var coc = calculateCoC(listing);
            if (coc < minRoi) return false;

            return true;
        });

        // Sort by grade then CoC
        filtered.sort(function (a, b) {
            var cocA = calculateCoC(a);
            var cocB = calculateCoC(b);
            var gradeA = calculateGrade(a, cocA);
            var gradeB = calculateGrade(b, cocB);

            if (gradeA !== gradeB) return gradeA.localeCompare(gradeB);
            return cocB - cocA;
        });

        renderResults(filtered);
    }

    // Event listeners
    document.getElementById('search-btn').addEventListener('click', filterListings);

    // Run search on load with defaults
    filterListings();
})();
