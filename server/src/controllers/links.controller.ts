import type { Request, Response } from "express";
import * as linksService from "../services/links.service.js";
import { config } from "../config.js"

export function getShortenURLStat(req: Request, res: Response){
    // validate input
    if (!req.params.code || typeof req.params.code !== "string") {
        return res.status(400).json({error: "Invalid shortenURL"});
    }

    // call service and return
    const stats = linksService.getLinkStats(req.params.code);
    if (!stats) {
        return res.status(404).json({error: "ShortenURL not found"});
    }
    res.status(200).json({longURL: stats.longURL, clicks: stats.clicks})
};

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function createShortenURL(req: Request, res: Response){
    // val body
    // ? zod now? how to ensure longURL is string?
    const longURL = req.body?.longURL;
    if (!longURL) {
        return res.status(400).json({ error: "URL to shorten is required" });
    }
    if (typeof longURL !== "string") {
        return res.status(400).json({ error: "URL to shorten should be a string" });
    }
    if (!isValidUrl(longURL)) {
        return res.status(400).json({ error: "URL invalid" });
    }

    const code = linksService.createLink(longURL);
    const shortenURL = config.baseUrl + '/' + code;

    res.status(201).json({shortenURL});
};


export function redirectShortenURL(req: Request, res: Response){
    const code = req.params?.code;
    if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: "shortenURL is required" });
    }

    const longURL = linksService.resolveLink(code);
    if (!longURL) {
        return res.status(404).json({error: "ShortenURL not found"});
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache'); // For HTTP/1.0 legacy support
    res.setHeader('Expires', '0');       // Proxies will consider this immediately expired

    res.redirect(302, longURL);
};