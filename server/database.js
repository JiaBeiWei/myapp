const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	account: { type: Number, required: true, unique: true },
	username: { type: String, required: [true, "can't be blank"] },
	email: { type: String, match: [/\S+@\S+\.\S+/, 'is invalid'] },
	phone: { type: Number },
	password: { type: String },
	friends: [ Number ]
}, {timestamps: true});

const messageSchema = new Schema({
	from: { type: Number, required: true },
	username: String,
	to: { type: Number, required: true },
	message: String,
	read: { type: Boolean, default: false },
}, {timestamps: true});

const sessionStore = new Schema({
	account: { type: Number, unique: true, required: true },
	username: { type: String },
	connected: { type: Boolean, default: false },
	session: String,
	dialog: Array
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema); 
const Session = mongoose.model('Session', sessionStore); 

module.exports = { User, Message, Session };
