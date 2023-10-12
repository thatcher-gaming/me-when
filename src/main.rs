use crate::{config::BotConfig, bot::Bot};

mod bot;
mod config;
mod commands;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let config = BotConfig::load();
    let bot = Bot::build(config).await?;
    bot.start().await?;

    Ok(())
}
