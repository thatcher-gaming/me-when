use crate::bot;

/// commence the pinging
#[poise::command(slash_command)]
pub async fn ping(ctx: bot::Context<'_>) -> Result<(), bot::Error> {
    ctx.say("pong").await?;
    Ok(())
}
