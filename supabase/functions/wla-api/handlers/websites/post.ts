export const postWebsites = async (c) => {
    // check empty body
    const bodyText = await c.req.text();
    if (!bodyText) {
        console.log('empty body', bodyText);
        return c.json({ error: 'empty body' }, 400);
    }

    // validate payload
    const payload = await c.req.json();
    const { websites, commit, timestamp, columns } = payload;
    if (
        !websites ||
        !Array.isArray(websites) ||
        !websites.length ||
        !commit ||
        !timestamp ||
        !columns
    ) {
        console.log('invalid payload', payload);
        return c.json({ error: 'invalid payload' }, 400);
    }

    const { env } = c.req.query();

    try {
        // store websites to websites table
        const stmt = c.env.DB.prepare(`
      REPLACE
      INTO websites (env, website, data)
      VALUES (?, LOWER(?), ?)
    `);

        const batch = [];
        for (const website of websites) {
            batch.push(stmt.bind(env, website['website'], JSON.stringify(website)));
        }
        const result = await c.env.DB.batch(batch);

        // store commit and timestamp into info table
        await c.env.DB.prepare(
            `
        REPLACE
        INTO info (env, "commit", timestamp)
        VALUES (?, ?, ?)
      `,
        )
            .bind(env, commit, timestamp)
            .run();

        // store columns into columns table
        await c.env.DB.prepare(
            `
        REPLACE
        INTO columns (env, columns)
        VALUES (?, ?)
      `,
        )
            .bind(env, JSON.stringify(columns))
            .run();

        console.log('websites', websites?.length, commit);
        return c.json({ count: result.length });
    } catch (e) {
        console.log('failed to save websites', e.message);
        return c.json({ error: e.message }, 500);
    }
};
