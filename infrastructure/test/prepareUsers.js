const leos = {"_id": "1e40v0b1j5",
    "auth": {
        "email": "leos@email.bud",
        "pwdHash": "$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO",
        "pwdTimestamp": new Date(),
        "verified": true
    },
    "bio": {"nickname": "literakl", "born": "1975", "edu": "university", "region": "PRG", "sex": "man"},
    "driving": {"since": "2007", "vehicles": ["car"]},
    "prefs": {"public": false},
    "consent": {"terms": new Date(), "data": new Date()},
    "roles": ["admin:poll"]
};
const jiri = {"_id": "1e416vocls",
    "auth": {
        "email": "jiri@email.bud",
        "pwdHash": "$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO",
        "pwdTimestamp": new Date(),
        "verified": true
    },
    "bio": {"nickname": "jirka", "born": "1978", "edu": "primary", "region": "MS", "sex": "man"},
    "driving": {"since": "1996", "vehicles": ["bike", "car"]},
    "prefs": {"public": false},
    "consent": {"terms": new Date(), "data": new Date()}
};
const lukas = {"_id": "1e4176ttr8",
    "auth": {
        "email": "lukas@email.bud",
        "pwdHash": "$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO",
        "pwdTimestamp": new Date(),
        "verified": true
    },
    "bio": {"nickname": "Lukáš", "region": "OLM"},
    "driving": {},
    "prefs": {"public": false},
    "consent": {"terms": new Date(), "data": new Date()}
};
const vita = {"_id": "1e41795qjw",
    "auth": {
        "email": "vita@email.bud",
        "pwdHash": "$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO",
        "pwdTimestamp": new Date(),
        "verified": true
    },
    "bio": {"nickname": "Víťa", "born": "1980", "edu": "university", "region": "JM", "sex": "man"},
    "driving": {"since": "2000", "vehicles": ["bike", "car", "van"]},
    "prefs": {"public": false},
    "consent": {"terms": new Date(), "data": new Date()}
};
const jana = {"_id": "1e417bgivc",
    "auth": {
        "email": "jana@email.bud",
        "pwdHash": "$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO",
        "pwdTimestamp": new Date(),
        "verified": true
    },
    "bio": {"nickname": "Jana", "born": "1982", "edu": "secondary", "region": "SC", "sex": "woman"},
    "driving": {"since": "2017", "vehicles": ["car"]},
    "prefs": {"public": false},
    "consent": {"terms": new Date(), "data": new Date()}
};
const bara = {"_id": "1e417edlqb",
    "auth": {
        "email": "bara@email.bud",
        "pwdHash": "$2a$10$EgZrIC7jmLGatzhLZeolAuJzL1peobCO5sTUIYa1c2XKNCRRNd2WO",
        "pwdTimestamp": new Date(),
        "verified": true
    },
    "bio": {"nickname": "Barbora", "born": "1985", "edu": "university", "region": "PRG", "sex": "woman"},
    "driving": {"since": "2019", "vehicles": ["bus", "truck", "tramway"]},
    "prefs": {"public": false},
    "consent": {"terms": new Date(), "data": new Date()}
};

module.exports.leos = leos;
module.exports.jiri = jiri;
module.exports.lukas = lukas;
module.exports.vita = vita;
module.exports.jana = jana;
module.exports.bara = bara;