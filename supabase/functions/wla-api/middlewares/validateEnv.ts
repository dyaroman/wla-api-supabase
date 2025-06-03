export const validateEnv = async (c, next) => {
    const { env } = c.req.query();
    if (!env || !['dev', 'prod'].includes(env)) {
        console.log('invalid env:', env);
        return c.json({ error: 'invalid env' }, 400);
    }
    await next();
};
