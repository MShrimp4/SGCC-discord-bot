require('dotenv').config();
const Discord = require('discord.js');
const findData = require('./crawl_xkcd.js');
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds,
                                              Discord.GatewayIntentBits.GuildMessages,
                                              Discord.GatewayIntentBits.GuildVoiceStates] });

console.log("Client loaded");

// init values
let channelCount = -1;
let channelPeople = [];
const messageOut = ['어디가ㅏㅏㅏㅏㅏ', '가지마ㅏㅏㅏㅏ', '돌아와ㅏㅏㅏㅏㅏ'];

// login discord bot
(async () => {
  const login_promise = await client.login(process.env.TOKEN);
  await client.channels.fetch(process.env.TARGET_CHANNEL)
    .send("내가 돌아왔다");
})();

console.log("connected");

const dday = (date_str) => {
  let diff = new Date(date_str) - new Date();
  let days = Math.ceil(diff / (1000 * 3600 * 24));
  if (days === 0){
    return "D-DAY";
  }
  else {
    return "D" + (-days).toString();
  }
}

const getRandomImgUrl = () => {
	return "https://picsum.photos/200/300";
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const GreetingMessage = (person, num) => {
  if (person == "야인") {
    return "여어";
  }
  switch (num) {
    case 0:
      if (getRandomInt (0,10) == 0) {
        return `${person}군은 요즘 뭐하고 지내십니까`;
      }
      return `${person} 왔구나`;
    case 1:
      return `${person} 왔구나! \`개강 ${dday("2023-03-02")}\``;
    case 2:
      return `여어 ${person}`;
    case 3:
      return `${person} 왔구나! \`기말 ${dday("2022-12-15")}\``;
    case 4:
      return `${person} 왔구나! \`종강 ${dday("2022-12-21")}\``;
    default:
      return GreetingMessage (person, getRandomInt (0,5));
  }
}

// compare comp with target
const checkDiff = (origin, target) => {
  let people = [];
  for (let person of origin) {
    if (!target.includes(person)) {
      people.push(person);
    }
  }
  return people;
};

const getPeople = (channel) => {
  let members = channel ? Array.from(channel.members) : [];
  let curPeople = members.map((x) => {
    return x[1].displayName;
  });
  
  return [members.length, curPeople];
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* check how many people in the specific channel
   and send the message when count changes. */
const count = async () => {
  const channel = await client.channels.cache.find(
    (channel) => (channel.id === process.env.COUNT_CHANNEL)
  );

  var [curCount, curPeople] = getPeople(channel);

  if (channelCount === -1) {
    channelCount = curCount;
    channelPeople = curPeople;
    return;
  }

  if (channelCount > curCount) {
    const people = checkDiff(channelPeople, curPeople);

    for (let person of people) {
      console.log("Left : ", JSON.stringify(person))
      await client.channels.cache
        .find((channel) => channel.id === process.env.TARGET_CHANNEL)
        .send(`${person} ${messageOut[getRandomInt(0, messageOut.length)]}`);
    }

    if (curCount === 0) {
      await client.channels.cache
        .find((channel) => channel.id === process.env.TARGET_CHANNEL)
        .send(`내 인터넷 친구들 어디가써!`);
//	  const url = await findData();
//	  await client.channels.cache
//		.find((channel) => channel.id === process.env.TARGET_CHANNEL)
//		.send("random xkcd img", {files:[url]});
	}
  } else if (channelCount < curCount) {
    const people = checkDiff(curPeople, channelPeople);

    for (let person of people) {
      console.log("Joined : ", JSON.stringify(person))
      await client.channels.cache
        .find((channel) => channel.id === process.env.TARGET_CHANNEL)
    	.send(GreetingMessage (person, -1));
    }
  }
  channelCount = curCount;
  channelPeople = curPeople;
};

/* Recursive setTimeout guarantees the given delay 
   between the code execution completion and the next call.
   But, setInterval doesn't guarantee the given delay. */
const mySetInterval = () => {
  setTimeout(async () => {
    await count();
    mySetInterval();
  }, 1000);
};

mySetInterval();
