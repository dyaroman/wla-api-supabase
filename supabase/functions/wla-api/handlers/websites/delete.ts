export const deleteWebsites = async (c) => {
    // check empty body
    const bodyText = await c.req.text();
    if (!bodyText) {
        console.log('empty body', bodyText);
        return c.json({ error: 'empty body' }, 400);
    }

    // validate payload
    const websites = await c.req.json();
    if (!websites || !Array.isArray(websites) || !websites.length) {
        console.log('invalid payload', websites);
        return c.json({ error: 'invalid payload' }, 400);
    }

    const { env } = c.req.query();

    try {
        // delete websites from websites table
        const stmt = c.env.DB.prepare(
            'DELETE FROM websites WHERE env = (?) AND website COLLATE NOCASE = (?)',
        );
        const batch = [];
        for (const website of websites) {
            batch.push(stmt.bind(env, website));
        }
        const result = await c.env.DB.batch(batch);

        console.log('websites', websites);
        return c.json({ count: result.length });
    } catch (e) {
        console.log('failed to delete websites', e.message);
        return c.json({ error: e.message }, 500);
    }
};
