import { IBot, IBotCommand, IBotCommandHelp, IBotMessage } from "../api";

export default class GiveRolesCommand implements IBotCommand {
    private readonly CMD_REGEXP = /^\/(giveroles)(?: |$)/im;
    private _bot: IBot;

    constructor(bot: IBot, dataPath: string) {
        this._bot = bot;
    }

    public getHelp(): IBotCommandHelp {
        return { caption: "/giveroles", description: "Give role to users." };
    }

    public isValid(msg: string): boolean {
        return this.CMD_REGEXP.test(msg);
    }
    public async process(msg: string, answer: IBotMessage): Promise<void> {
        try {
            answer.hasResponse = false;
            answer.message.channel.send(`Fetching all members`);
            const allMembers = await this._bot.guild.members.fetch();
            answer.message.channel.send(`Fetched all members`);
            //for (const mem of allMembers) {
            //    answer.message.channel.send(`${mem}`);
            //}
            answer.message.channel.send(`Role to assign:`);
            answer.message.channel.send(this._bot.role.id);
            const members = allMembers
                //.filter((m) => this._bot.userTags.has(m.user.tag))
                //.filter((m) => !m.roles.cache.has(this._bot.role.id))
                .array();
            answer.message.channel.send(`Assigning role to ${members.length} members`);
            const addRole = (member) => {
                answer.message.channel.send(member); 
                return member.roles.add(this._bot.role);
            };
            members.reduce((previousPromise, nextMember) => {
                return previousPromise.then(() => {
                    return addRole(nextMember);
                });
            }, Promise.resolve())
            .then(() => {
                answer.message.channel.send(`Successfully assigned roles`);
            })
            .catch((err) => {
                answer.message.channel.send(`Error assigning roles ${err}`);
            });
        } catch (e) {
            answer.message.channel.send(`${e}`);
        }
    }
}