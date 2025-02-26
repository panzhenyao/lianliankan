/**
 * 连连看路径查找工具
 * 用于检查两个卡片是否可以通过有效路径连接
 */

// 检查两个卡片是否可以连接
export function canConnect(board, card1, card2) {
  // 基本检查
  if (!isValidPair(card1, card2)) {
    return false;
  }

  // 查找路径
  const path = findPath(board, card1, card2);
  return path.length > 0;
}

// 检查是否是有效的卡片对
function isValidPair(card1, card2) {
  // 类型必须相同
  if (card1.type.symbol !== card2.type.symbol) {
    return false;
  }

  // 已匹配的卡片不能再次连接
  if (card1.matched || card2.matched) {
    return false;
  }

  // 同一张卡片不能自己连接自己
  if (card1.rowIndex === card2.rowIndex && card1.colIndex === card2.colIndex) {
    return false;
  }

  return true;
}

// 查找两个卡片之间的连接路径
export function findPath(board, card1, card2) {
  // 基础检查
  if (!board || !card1 || !card2) {
    console.error("findPath: 无效的参数", { board, card1, card2 });
    return [];
  }

  // 如果是同一张卡片，返回空路径
  if (card1.rowIndex === card2.rowIndex && card1.colIndex === card2.colIndex) {
    return [];
  }

  // 类型必须匹配
  if (card1.type.symbol !== card2.type.symbol) {
    return [];
  }

  // 已匹配的卡片不能再次连接
  if (card1.matched || card2.matched) {
    return [];
  }

  // 尝试直线连接
  const directPath = checkDirectLine(board, card1, card2);
  if (directPath.length > 0) {
    return directPath;
  }

  // 尝试一次拐角连接
  const oneCornerPath = checkOneCorner(board, card1, card2);
  if (oneCornerPath.length > 0) {
    return oneCornerPath;
  }

  // 尝试两次拐角连接
  const twoCornerPath = checkTwoCorners(board, card1, card2);
  if (twoCornerPath.length > 0) {
    return twoCornerPath;
  }

  return []; // 无法连接
}

// 检查是否是选中的两张卡片之一
function isOneOfCards(row, col, card1, card2) {
  return (
    (row === card1.rowIndex && col === card1.colIndex) ||
    (row === card2.rowIndex && col === card2.colIndex)
  );
}

// 检查路径上是否有障碍物 - 修复版本
function hasObstacle(board, startRow, startCol, endRow, endCol, card1, card2) {
  // 水平方向检查
  if (startRow === endRow) {
    const row = startRow;
    const minCol = Math.min(card1.colIndex, card2.colIndex);
    const maxCol = Math.max(card1.colIndex, card2.colIndex);
    
    for (let col = minCol + 1; col < maxCol; col++) {
      if (!board[row][col].matched && !isOneOfCards(row, col, card1, card2)) {
        return true; // 有障碍物
      }
    }
    return false;
  }
  
  // 垂直方向检查
  if (startCol === endCol) {
    const col = startCol;
    const minRow = Math.min(card1.rowIndex, card2.rowIndex);
    const maxRow = Math.max(card1.rowIndex, card2.rowIndex);
    
    for (let row = minRow + 1; row < maxRow; row++) {
      if (!board[row][col].matched && !isOneOfCards(row, col, card1, card2)) {
        return true; // 有障碍物
      }
    }
    return false;
  }
  
  return true; // 非直线，默认有障碍
}

// 检查直线连接
function checkDirectLine(board, card1, card2) {
  // 只有在同一行或同一列时才可能直线连接
  if (card1.rowIndex !== card2.rowIndex && card1.colIndex !== card2.colIndex) {
    return [];
  }
  
  // 检查路径上是否有障碍物
  if (hasObstacle(board, card1.rowIndex, card1.colIndex, card2.rowIndex, card2.colIndex, card1, card2)) {
    return [];
  }
  
  // 返回连接路径
  return [
    { row: card1.rowIndex, col: card1.colIndex },
    { row: card2.rowIndex, col: card2.colIndex }
  ];
}

// 检查一次拐角连接
function checkOneCorner(board, card1, card2) {
  const rows = board.length;
  const cols = board[0].length;
  
  // 尝试两个可能的拐角点
  const corner1 = { row: card1.rowIndex, col: card2.colIndex }; // 水平-垂直拐角
  const corner2 = { row: card2.rowIndex, col: card1.colIndex }; // 垂直-水平拐角
  
  // 检查第一个拐角
  if (
    corner1.row >= 0 && corner1.row < rows &&
    corner1.col >= 0 && corner1.col < cols &&
    (board[corner1.row][corner1.col].matched || isOneOfCards(corner1.row, corner1.col, card1, card2))
  ) {
    // 路径1: 卡片1到拐角点
    const path1Ok = !hasObstacle(board, card1.rowIndex, card1.colIndex, corner1.row, corner1.col, card1, {rowIndex: corner1.row, colIndex: corner1.col});
    
    // 路径2: 拐角点到卡片2
    const path2Ok = !hasObstacle(board, corner1.row, corner1.col, card2.rowIndex, card2.colIndex, {rowIndex: corner1.row, colIndex: corner1.col}, card2);
    
    if (path1Ok && path2Ok) {
      return [
        { row: card1.rowIndex, col: card1.colIndex },
        { row: corner1.row, col: corner1.col },
        { row: card2.rowIndex, col: card2.colIndex }
      ];
    }
  }
  
  // 检查第二个拐角
  if (
    corner2.row >= 0 && corner2.row < rows &&
    corner2.col >= 0 && corner2.col < cols &&
    (board[corner2.row][corner2.col].matched || isOneOfCards(corner2.row, corner2.col, card1, card2))
  ) {
    // 路径1: 卡片1到拐角点
    const path1Ok = !hasObstacle(board, card1.rowIndex, card1.colIndex, corner2.row, corner2.col, card1, {rowIndex: corner2.row, colIndex: corner2.col});
    
    // 路径2: 拐角点到卡片2
    const path2Ok = !hasObstacle(board, corner2.row, corner2.col, card2.rowIndex, card2.colIndex, {rowIndex: corner2.row, colIndex: corner2.col}, card2);
    
    if (path1Ok && path2Ok) {
      return [
        { row: card1.rowIndex, col: card1.colIndex },
        { row: corner2.row, col: corner2.col },
        { row: card2.rowIndex, col: card2.colIndex }
      ];
    }
  }
  
  return []; // 无法通过一次拐角连接
}

// 检查两次拐角连接
function checkTwoCorners(board, card1, card2) {
  const rows = board.length;
  const cols = board[0].length;
  
  // 水平方向扫描
  for (let col = 0; col < cols; col++) {
    // 跳过卡片自身的列
    if (col === card1.colIndex || col === card2.colIndex) continue;
    
    const corner1 = { row: card1.rowIndex, col: col };
    const corner2 = { row: card2.rowIndex, col: col };
    
    // 检查两个拐角点是否可用
    if (
      isEmptyPosition(board, corner1, card1, card2) &&
      isEmptyPosition(board, corner2, card1, card2) &&
      !hasObstacle(board, card1.rowIndex, card1.colIndex, corner1.row, corner1.col, card1, {rowIndex: corner1.row, colIndex: corner1.col}) &&
      !hasObstacle(board, corner1.row, corner1.col, corner2.row, corner2.col, {rowIndex: corner1.row, colIndex: corner1.col}, {rowIndex: corner2.row, colIndex: corner2.col}) &&
      !hasObstacle(board, corner2.row, corner2.col, card2.rowIndex, card2.colIndex, {rowIndex: corner2.row, colIndex: corner2.col}, card2)
    ) {
      return [
        { row: card1.rowIndex, col: card1.colIndex },
        { row: corner1.row, col: corner1.col },
        { row: corner2.row, col: corner2.col },
        { row: card2.rowIndex, col: card2.colIndex }
      ];
    }
  }
  
  // 垂直方向扫描
  for (let row = 0; row < rows; row++) {
    // 跳过卡片自身的行
    if (row === card1.rowIndex || row === card2.rowIndex) continue;
    
    const corner1 = { row: row, col: card1.colIndex };
    const corner2 = { row: row, col: card2.colIndex };
    
    // 检查两个拐角点是否可用
    if (
      isEmptyPosition(board, corner1, card1, card2) &&
      isEmptyPosition(board, corner2, card1, card2) &&
      !hasObstacle(board, card1.rowIndex, card1.colIndex, corner1.row, corner1.col, card1, {rowIndex: corner1.row, colIndex: corner1.col}) &&
      !hasObstacle(board, corner1.row, corner1.col, corner2.row, corner2.col, {rowIndex: corner1.row, colIndex: corner1.col}, {rowIndex: corner2.row, colIndex: corner2.col}) &&
      !hasObstacle(board, corner2.row, corner2.col, card2.rowIndex, card2.colIndex, {rowIndex: corner2.row, colIndex: corner2.col}, card2)
    ) {
      return [
        { row: card1.rowIndex, col: card1.colIndex },
        { row: corner1.row, col: corner1.col },
        { row: corner2.row, col: corner2.col },
        { row: card2.rowIndex, col: card2.colIndex }
      ];
    }
  }
  
  return []; // 无法通过两次拐角连接
}

// 检查位置是否为空（已匹配或是卡片本身）
function isEmptyPosition(board, position, card1, card2) {
  return (
    board[position.row][position.col].matched || 
    isOneOfCards(position.row, position.col, card1, card2)
  );
}