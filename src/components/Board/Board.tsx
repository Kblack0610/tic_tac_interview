import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useGameStore } from '../../store/game-store';
import { CellIndex } from '../../engine/types';
import { Cell } from './Cell';
import { WinLine } from './WinLine';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';
import { BOARD_PADDING, CELL_GAP, BOARD_SIZE } from '../../constants';

export function Board() {
  const { width: screenWidth } = useWindowDimensions();
  const {
    board, result, isAIThinking, lastMove, playMove,
  } = useGameStore();

  const boardWidth = Math.min(screenWidth - 48, 380);
  const cellSize = (boardWidth - BOARD_PADDING * 2 - CELL_GAP * (BOARD_SIZE - 1)) / BOARD_SIZE;

  const winningCells = useMemo(() => {
    if (result.status === 'win') {
      return new Set(result.line);
    }
    return new Set<number>();
  }, [result]);

  const isGameOver = result.status !== 'playing';
  const disabled = isGameOver || isAIThinking;

  return (
    <View style={[styles.container, { width: boardWidth, height: boardWidth }]}>
      <View style={styles.grid}>
        {board.map((value, i) => (
          <Cell
            key={i}
            index={i as CellIndex}
            value={value}
            size={cellSize}
            disabled={disabled}
            isWinning={winningCells.has(i)}
            isLastMove={lastMove === i}
            onPress={playMove}
          />
        ))}
      </View>
      {result.status === 'win' && (
        <WinLine
          line={result.line}
          cellSize={cellSize}
          gap={CELL_GAP}
          padding={BOARD_PADDING}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.bg.secondary,
    borderRadius: borderRadius.xl,
    padding: BOARD_PADDING,
    alignSelf: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CELL_GAP,
  },
});
