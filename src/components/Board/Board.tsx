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

  const boardWidth = Math.min(screenWidth * 0.85, 320);
  const cellSize = Math.floor(
    (boardWidth - BOARD_PADDING * 2 - CELL_GAP * (BOARD_SIZE - 1)) / BOARD_SIZE,
  );
  const actualBoardWidth = cellSize * BOARD_SIZE + CELL_GAP * (BOARD_SIZE - 1) + BOARD_PADDING * 2;

  const winningCells = useMemo(() => {
    if (result.status === 'win') {
      return new Set(result.line);
    }
    return new Set<number>();
  }, [result]);

  const isGameOver = result.status !== 'playing';
  const disabled = isGameOver || isAIThinking;

  // Build rows explicitly for reliable layout
  const rows = [0, 1, 2].map((row) =>
    [0, 1, 2].map((col) => row * 3 + col),
  );

  return (
    <View style={[styles.container, { width: actualBoardWidth }]}>
      {rows.map((rowIndices, rowIdx) => (
        <View key={rowIdx} style={[styles.row, rowIdx < 2 && { marginBottom: CELL_GAP }]}>
          {rowIndices.map((cellIdx, colIdx) => (
            <View key={cellIdx} style={colIdx < 2 ? { marginRight: CELL_GAP } : undefined}>
              <Cell
                index={cellIdx as CellIndex}
                value={board[cellIdx]}
                size={cellSize}
                disabled={disabled}
                isWinning={winningCells.has(cellIdx)}
                isLastMove={lastMove === cellIdx}
                onPress={playMove}
              />
            </View>
          ))}
        </View>
      ))}
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
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
});
