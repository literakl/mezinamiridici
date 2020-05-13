conn = new Mongo();
db = conn.getDB('bud');

db.users.createIndex({ 'auth.email': 1 }, { collation: { locale: 'cs', strength: 2 }, unique: true });
db.users.createIndex({ 'bio.nickname': 1 }, { collation: { locale: 'cs', strength: 1 }, unique: true });
db.items.createIndex({ 'info.type': 1 });
db.items.createIndex({ 'info.date': 1 });
db.items.createIndex({ 'info.slug': 1 }, { unique: true });
db.poll_votes.createIndex({ item: 1, user: 1 }, { unique: true });
