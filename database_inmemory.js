/* @flow */
/*
 * You may redistribute this program and/or modify it under the terms of
 * the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

const addMessage = (ctx, nodeIp, annHash, timestamp, annBin, peersIp6, cb) => {
    const message_id = ++ctx.last_message_id;
    const message /*:[string, number, Buffer]*/ = [nodeIp, timestamp, annBin];
    ctx.messages.set(annHash, message);
    for (const peerIp6 of peersIp6) {
        const announcement_id = ++ctx.last_announcement_id;
        const announcement /*:[string, string, string, number]*/ = [nodeIp, annHash, peerIp6, timestamp]
        ctx.announcements.set(announcement_id, announcement);
    }
    cb();
};

const garbageCollect = (ctx, minTs, cb) => {
    for (const e of ctx.announcements.entries()) {
        const id = e[0];
        const ann = e[1];
        if (ann[3] < minTs) {
            ctx.announcements.delete(id);
        }
    }
    for (const e of ctx.messages.entries()) {
        const hash = e[0];
        const msg = e[1];
        if (msg[1] < minTs) {
            ctx.messages.delete(hash);
        }
    }
    cb();
};

const getMessage = (ctx, hash, cb) => {
    const row = ctx.messages.get(hash);
    if (typeof row === 'undefined') {
        cb(undefined);
    }
    else {
        cb(row[2]);
    }
};

const deleteMessage = (ctx, hash, cb) => {
    ctx.messages.delete(hash);
    for (const e of ctx.announcements.entries()) {
        const id = e[0];
        const ann = e[1];
        if (ann[1] === hash) {
            ctx.announcements.delete(id);
        }
    }
    cb();
};

const getMessageHashes = (ctx, hashCb, doneCb) => {
    ctx.messages.forEach((_msg, hash, _mesgs) => hashCb(hash));
    doneCb();
};

const getAllMessages = (ctx, msgCb, doneCb) => {
    for (const e of ctx.messages.entries()) {
        const hash = e[0];
        const msg = e[1];
        msgCb(msg[2]);
    }
    doneCb();
};

/*::const ConfigType = require('./config.example.js');*/
module.exports.create = (config /*:typeof(ConfigType)*/) => {
    var messages /*:Map<string, [string, number, Buffer]>*/ = new Map();
    var announcements /*:Map<number, [string, string, string, number]>*/ = new Map();
    const ctx = Object({
        last_message_id: 0,
        last_announcement_id: 0,
        messages: messages,
        announcements: announcements,
    });
    return {
        addMessage: (
            nodeIp /*:string*/,
            annHash /*:string*/,
            timestamp /*:number*/,
            annBin /*:Buffer*/,
            peersIp6 /*:Array<string>*/,
            cb /*:()=>void*/
        ) => {
            addMessage(ctx, nodeIp, annHash, timestamp, annBin, peersIp6, cb);
        },
        deleteMessage: (hash /*:string*/, cb /*:()=>void*/) => {
            deleteMessage(ctx, hash, cb);
        },
        garbageCollect: (minTs /*:number*/, cb /*:()=>void*/) => {
            garbageCollect(ctx, minTs, cb);
        },
        getMessage: (hash /*:string*/, cb /*:(?Buffer)=>void*/) => {
            getMessage(ctx, hash, cb);
        },
        getMessageHashes: (hashCb /*:(string)=>void*/, doneCb /*:()=>void*/) => {
            getMessageHashes(ctx, hashCb, doneCb);
        },
        getAllMessages: (msgCb /*:(Buffer)=>void*/, doneCb /*:()=>void*/) => {
            getAllMessages(ctx, msgCb, doneCb);
        },
        disconnect: (cb /*:()=>void*/) => {
        }
    };
};
