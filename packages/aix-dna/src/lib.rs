use sha2::{Sha256, Digest};
use std::fs;
use std::path::Path;
use anyhow::{Result, Context};

pub fn sign_dna(file_path: &Path) -> Result<String> {
    let content = fs::read_to_string(file_path)
        .with_context(|| format!("Failed to read file: {:?}", file_path))?;

    // Step 1: Create a "clean" version for hashing
    // We replace the genesis_hash value with an empty string to ensure the hash is stable
    let re = regex::Regex::new(r#"(?m)^(\s*genesis_hash:\s*)"[^"]*""#).unwrap();
    let clean_content = re.replace_all(&content, r#"$1"""#);

    // Step 2: Calculate SHA-256
    let mut hasher = Sha256::new();
    hasher.update(clean_content.as_bytes());
    let hash = format!("{:x}", hasher.finalize());

    // Step 3: Update the content with the new hash
    let signed_content = re.replace_all(&content, format!(r#"$1"{}"#"#, hash).as_str());

    fs::write(file_path, signed_content.to_string())
        .with_context(|| format!("Failed to write signed file: {:?}", file_path))?;

    Ok(hash)
}

pub fn verify_dna(file_path: &Path) -> Result<bool> {
    let content = fs::read_to_string(file_path)?;
    
    // Extract existing hash
    let re = regex::Regex::new(r#"(?m)^\s*genesis_hash:\s*"([^"]*)""#).unwrap();
    let existing_hash = re.captures(&content)
        .and_then(|cap| cap.get(1))
        .map(|m| m.as_str())
        .unwrap_or("");

    if existing_hash.is_empty() {
        return Ok(false);
    }

    // Calculate expected hash
    let clean_content = regex::Regex::new(r#"(?m)^(\s*genesis_hash:\s*)"[^"]*""#)
        .unwrap()
        .replace_all(&content, r#"$1"""#);

    let mut hasher = Sha256::new();
    hasher.update(clean_content.as_bytes());
    let calculated_hash = format!("{:x}", hasher.finalize());

    Ok(existing_hash == calculated_hash)
}
