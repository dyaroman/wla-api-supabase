export const getCommit = async (c) => {
    const { env } = c.req.query();

    try {
        const commit = await c.env.DB.prepare(
            'SELECT "commit" FROM info WHERE env = (?)',
        )
            .bind(env)
            .first();

        console.log('commit', commit);
        return c.json(commit);
    } catch (e) {
        console.log('failed to fetch info data', e.message);
        return c.json(
            {
                error: 'failed to fetch info data',
                message: e.message,
            },
            500,
        );
    }
};
