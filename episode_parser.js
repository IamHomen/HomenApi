import axios from 'axios';
import cheerio from 'cheerio';

import {
 generateEncryptAjaxParameters,
 decryptEncryptAjaxResponse,
} from './goload.js';

import { USER_AGENT, renameKey } from './utils.js';

const Referer = 'https://gogoplay.io/';
const goload_stream_url = 'https://goload.pro/streaming.php';

const BASE_URL2 = 'https://anitaku.to/';

export const getDriveDirectLink= async ({ id }) => {
 try {
  const driveUrl = `https://drive.usercontent.google.com/download?id=${id}&export=view&authuser=0`;
return driveUrl;
 } catch (err) {
  console.log(err);
  return { error: err };
 }
};

export const scrapeM3U8 = async ({ id }) => {
 let sources = [];
 let sources_bk = [];
 try {
  let epPage, server, $, serverUrl;

  if (id) {
   epPage = await axios.get(BASE_URL2 + id);
   $ = cheerio.load(epPage.data);

   server = $('#load_anime > div > div > iframe').attr('src');
   serverUrl = new URL(server);
  } else throw Error('Episode id not found');

  const goGoServerPage = await axios.get(serverUrl.href, {
   headers: { 'User-Agent': USER_AGENT },
  });
  const $$ = cheerio.load(goGoServerPage.data);

  const params = await generateEncryptAjaxParameters(
   $$,
   serverUrl.searchParams.get('id')
  );

  const fetchRes = await axios.get(
   `
        ${serverUrl.protocol}//${serverUrl.hostname}/encrypt-ajax.php?${params}`,
   {
    headers: {
     'User-Agent': USER_AGENT,
     'X-Requested-With': 'XMLHttpRequest',
    },
   }
  );

  const res = decryptEncryptAjaxResponse(fetchRes.data);

  if (!res.source) return { error: 'No sources found!! Try different source.' };

  res.source.forEach((source) => sources.push(source));
  res.source_bk.forEach((source) => sources_bk.push(source));

  return {
   Referer: serverUrl.href,
   sources: sources,
   sources_bk: sources_bk,
  };
 } catch (err) {
  return { error: err };
 }
};
