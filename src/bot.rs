use poise::serenity_prelude as serenity;

use poise::{Framework, FrameworkBuilder};
use serenity::prelude::GatewayIntents;

use crate::config::BotConfig;

pub struct State {}
pub type Error = Box<dyn std::error::Error + Send + Sync>;
pub type Context<'a> = poise::Context<'a, State, Error>;

pub struct Bot {
    pub config: BotConfig,
    pub framework: FrameworkBuilder<State, Error>,
}

impl Bot {
    pub async fn build(config: BotConfig) -> anyhow::Result<Self> {
        let intents =
            GatewayIntents::non_privileged() | GatewayIntents::MESSAGE_CONTENT;

        let framework: FrameworkBuilder<State, Error> = Framework::builder()
            .options(poise::FrameworkOptions {
                commands: vec![crate::commands::ping()],
                ..Default::default()
            })
            .token(&config.token)
            .intents(intents)
            .setup(|ctx, _ready, framework| {
                Box::pin(async move {
                    poise::builtins::register_globally(
                        ctx,
                        &framework.options().commands,
                    )
                    .await?;
                    Ok(State {})
                })
            });

        Ok(Bot { config, framework })
    }

    pub async fn start(self) -> anyhow::Result<()> {
        self.framework.run().await?;
        Ok(())
    }
}
