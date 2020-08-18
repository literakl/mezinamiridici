conn = new Mongo();
db = conn.getDB('bud');

db.users.createIndex({ 'auth.email': 1 }, { unique: true });
db.users.createIndex({ 'bio.nickname': 1 }, { unique: true });
db.items.createIndex({ 'info.type': 1 });
db.items.createIndex({ 'info.date': 1 });
db.items.createIndex({ 'info.slug': 1 }, { unique: true });
db.poll_votes.createIndex({ item: 1, user: 1 }, { unique: true });
db.comments.createIndex({ itemId: 1 });
db.comments.createIndex({ parentId: 1 });
db.comment_votes.createIndex({ commentId: 1, 'user.id': 1 }, { unique: true });
db.link_shares.createIndex({ user: 1 });
db.link_shares.createIndex({ date: 1 });
