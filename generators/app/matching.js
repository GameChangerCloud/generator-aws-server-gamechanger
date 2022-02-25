// ADRESS FUNCTIONS
function isZip(s) {
    return (s.toLowerCase().includes("zip")
        || s.toLowerCase().includes("areacode"));
}
function isCity(s) {
    return (s.toLowerCase().includes("city")
        || s.toLowerCase().includes("town")
        || s.toLowerCase().includes("place")
        || s.toLowerCase().includes("burgh"));
}
function isAdress(s) {
    return (s.toLowerCase().includes("street")
        || s.toLowerCase().includes("adress"));
}
function isCountry(s) {
    return (s.toLowerCase().includes("country")
        || s.toLowerCase().includes("land")
        || s.toLowerCase().includes("nation"));
}
function isState(s) {
    return (s.toLowerCase().includes("state"));
}
function isLatitude(s) {
    return (s.toLowerCase().includes("latitude"));
}
function isLongitude(s) {
    return (s.toLowerCase().includes("longitude"));
}
// COMMERCE FUNCTIONS
function isColor(s) {
    return (s.toLowerCase().includes("color"));
}
function isProduct(s) {
    return (s.toLowerCase().includes("product"));
}
function isPrice(s) {
    return (s.toLowerCase().includes("price")
        || s.toLowerCase().includes("cost"));
}
// DATE FUNCTIONS
function isDateBefore(s) {
    return (s.toLowerCase().includes("birthday")
        || s.toLowerCase().includes("dayofbirth")
        || s.toLowerCase().includes("weddingdate")
        || s.toLowerCase().includes("graduationdate"));
}
function isDate(s) {
    return (s.toLowerCase().includes("date"));
}
function isMonth(s) {
    return (s.toLowerCase().includes("month"));
}
// FINANCE FUNCTIONS
function isIban(s) {
    return (s.toLowerCase().includes("iban"));
}
function isBic(s) {
    return (s.toLowerCase().includes("bic"));
}
function isBitcoin(s) {
    return (s.toLowerCase().includes("bitcoin"));
}
function isAmount(s) {
    return (s.toLowerCase().includes("amount")
        || s.toLowerCase().includes("salary")
        || s.toLowerCase().includes("pay")
        || s.toLowerCase().includes("bonus"));
}
// INTERNET FUNCTIONS
function isEmail(s) {
    return (s.toLowerCase().includes("mail"));
}
function isUsername(s) {
    return (s.toLowerCase().includes("login")
        || s.toLowerCase().includes("username")
        || s.toLowerCase().includes("pseudo"));
}
function isUrl(s) {
    return (s.toLowerCase().includes("url")
        || s.toLowerCase().includes("link"));
}
function isPassword(s) {
    return (s.toLowerCase().includes("password")
        || s.toLowerCase().includes("pwd"));
}
// LOREM FUNCTIONS
function isTitle(s) {
    return (s.toLowerCase().includes("title")
        || s.toLowerCase().includes("head")
        || s.toLowerCase().includes("sentence"));
}
function isText(s) {
    return (s.toLowerCase().includes("text")
        || s.toLowerCase().includes("script")
        || s.toLowerCase().includes("article")
        || s.toLowerCase().includes("paper")
        || s.toLowerCase().includes("blog")
        || s.toLowerCase().includes("story")
        || s.toLowerCase().includes("record"));
}
// NAME FUNCTIONS
function isFirstname(s) {
    return (s.toLowerCase().includes("firstname")
        || s.toLowerCase().includes("name"));
}
function isLastname(s) {
    return (s.toLowerCase().includes("lastname"));
}
function isJob(s) {
    return (s.toLowerCase().includes("job")
        || s.toLowerCase().includes("work")
        || s.toLowerCase().includes("employment")
        || s.toLowerCase().includes("business")
        || s.toLowerCase().includes("occupation"));
}
function isPhone(s) {
    return (s.toLowerCase().includes("phone")
        || s.toLowerCase().includes("call")
        || s.toLowerCase().includes("contact"));
}
// SYSTEM FUNCTIONS
function isFile(s) {
    return (s.toLowerCase().includes("file"));
}
function isVersion(s) {
    return (s.toLowerCase().includes("version"));
}
function matchString(s) {
    // ADRESS PART.
    if (isZip(s)) {
        return 'chance.zip()';
    }
    if (isCity(s)) {
        return 'chance.city()';
    }
    if (isAdress(s)) {
        return 'chance.street()';
    }
    if (isCountry(s)) {
        return 'chance.country()';
    }
    if (isState(s)) {
        return 'chance.state()';
    }
    if (isLatitude(s)) {
        return 'chance.latitude()';
    }
    if (isLongitude(s)) {
        return 'chance.longitude()';
    }
    // COMMERCE PART.
    if (isColor(s)) {
        return 'chance.color()';
    }
    // if (isProduct(s)) {
    //     return 'chance.commerce.product()';
    // }
    // if (isPrice(s)) {
    //     return 'chance.commerce.price()';
    // }
    // DATE PART.
    if (s.toLowerCase().endsWith("date")) {
        return 'getRandomDate()';
    }
    // if (isDateBefore(s)) {
    //     return 'chance.date.past()';
    // }
    // if (isDate(s)) {
    //     return 'chance.date.recent()';
    // }
    if (isMonth(s)) {
        return 'chance.month()';
    }
    // FINANCE PART.
    // if (isIban(s)) {
    //     return 'chance.finance.iban()';
    // }
    // if (isBic(s)) {
    //     return 'chance.finance.bic()';
    // }
    // if (isBitcoin(s)) {
    //     return 'chance.finance.bitcoinAddress()';
    // }
    // if (isAmount(s)) {
    //     return 'chance.finance.amount()';
    // }
    // INTERNET PART.
    if (isEmail(s)) {
        return 'chance.email()';
    }
    // if (isUsername(s)) {
    //     return 'chance.internet.userName()';
    // }
    if (isUrl(s)) {
        return 'chance.url()';
    }
    // if (isPassword(s)) {
    //     return 'chance.internet.password()';
    // }
    // LOREM PART.
    if (isTitle(s)) {
        return 'chance.sentence()';
    }
    if (isText(s)) {
        return 'chance.paragraph()';
    }
    // NAME PART.
    if (isLastname(s)) {
        return 'chance.name.last()';
    }
    if (isFirstname(s)) {
        return 'chance.name.first()';
    }
    if (isJob(s)) {
        return 'chance.name.profession()';
    }
    // PHONE PART.
    if (isPhone(s)) {
        return 'chance.phone()';
    }
    // SYSTEM PART.
    // if (isFile(s)) {
    //     return 'chance.system.fileName()';
    // }
    // if (isVersion(s)) {
    //     return 'chance.system.semver()';
    // }
    return 'chance.word()';
}
module.exports = {
    matchString: matchString
};
const chance = require('chance');

