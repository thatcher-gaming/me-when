use std::fs;

use serde::Deserialize;

#[derive(Deserialize)]
pub struct BotConfig {
    pub token: String,
}

const CONFIG_PATH: &str = "config.toml";

impl BotConfig {
    pub fn load() -> Self {
        let file = fs::read_to_string(CONFIG_PATH)
            .unwrap_or_else(|_| panic!("Failed to read {CONFIG_PATH}"));

        toml::from_str(&file).expect("Failed to parse config")
    }
}
