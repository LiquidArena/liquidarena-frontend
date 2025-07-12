# Mock Data README

This directory contains mock data for the Simple DEX application.

## Available Mock Data

The following mock data is available:

- `mockStats`: An array of objects with the following properties:
  - `id`: A unique identifier for the stat.
  - `title`: The title of the stat.
  - `value`: The value of the stat.
  - `icon`: A React component that renders an icon for the stat.
- `mocklpNFTs`: An array of objects with the following properties:
  - `id`: A unique identifier for the LP NFT.
  - `pairs`: The pairs of the LP NFT.
  - `value`: The value of the LP NFT.
  - `isActive`: A boolean indicating whether the LP NFT is active.
- `mockRecentBattles`: An array of objects with the following properties:
  - `id`: A unique identifier for the battle.
  - `isWinner`: A boolean indicating whether the user won the battle.

## Usage

To use the mock data, simply import the desired mock data and use it in your component.

For example, to use the `mockStats` data, you can import it like so:
