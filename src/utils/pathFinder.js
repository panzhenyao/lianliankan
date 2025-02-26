// 检查两个卡片是否可以连接
export function canConnect(board, card1, card2) {
    // 如果卡片类型不同，则不能连接
    if (card1.type.symbol !== card2.type.symbol) {
      return false;
    }
  
    // 已经匹配的卡片不能再次连接
    if (card1.matched || card2.matched) {
      return false;
    }
  
    // 同一张卡片不能自己连接自己
    if (card1.rowIndex === card2.rowIndex && card1.colIndex === card2.colIndex) {
      return false;
    }
  
    // 检查是否有有效路径
    const path = findPath(board, card1, card2);
    return path.length > 0;
  }
  
  // 查找两个卡片之间的路径
  export function findPath(board, card1, card2) {
    // 直线连接
    const directLine = checkDirectLine(board, card1, card2);
    if (directLine.length > 0) {
      return directLine;
    }
  
    // 一次拐角
    const oneCornerPath = checkOneCorner(board, card1, card2);
    if (oneCornerPath.length > 0) {
      return oneCornerPath;
    }
  
    // 两次拐角
    const twoCornerPath = checkTwoCorners(board, card1, card2);
    if (twoCornerPath.length > 0) {
      return twoCornerPath;
    }
  
    return []; // 无法连接
  }
  
  // 检查是否是两张卡片本身
  function isOneOfCards(row, col, card1, card2) {
    return (
      (row === card1.rowIndex && col === card1.colIndex) ||
      (row === card2.rowIndex && col === card2.colIndex)
    );
  }
  
  // 检查两点是否可以直线连接
  function checkDirectLine(board, card1, card2) {
    const path = [];
    
    // 如果在同一行
    if (card1.rowIndex === card2.rowIndex) {
      const row = card1.rowIndex;
      const startCol = Math.min(card1.colIndex, card2.colIndex);
      const endCol = Math.max(card1.colIndex, card2.colIndex);
      
      // 检查两点之间是否有障碍物
      for (let col = startCol + 1; col < endCol; col++) {
        // 修改：如果中间有未匹配的卡片且不是两张卡片本身，则视为障碍物
        if (!board[row][col].matched && !isOneOfCards(row, col, card1, card2)) {
          return []; // 有障碍物，无法直线连接
        }
      }
      
      path.push({ row: card1.rowIndex, col: card1.colIndex });
      path.push({ row: card2.rowIndex, col: card2.colIndex });
      return path;
    }
    
    // 如果在同一列
    if (card1.colIndex === card2.colIndex) {
      const col = card1.colIndex;
      const startRow = Math.min(card1.rowIndex, card2.rowIndex);
      const endRow = Math.max(card1.rowIndex, card2.rowIndex);
      
      // 检查两点之间是否有障碍物
      for (let row = startRow + 1; row < endRow; row++) {
        // 修改：如果中间有未匹配的卡片且不是两张卡片本身，则视为障碍物
        if (!board[row][col].matched && !isOneOfCards(row, col, card1, card2)) {
          return []; // 有障碍物，无法直线连接
        }
      }
      
      path.push({ row: card1.rowIndex, col: card1.colIndex });
      path.push({ row: card2.rowIndex, col: card2.colIndex });
      return path;
    }
    
    return []; // 不在同一行也不在同一列，无法直线连接
  }
  
  // 检查一次拐角连接
  function checkOneCorner(board, card1, card2) {
    const rows = board.length;
    const cols = board[0].length;
    
    // 尝试找到一个拐角点
    const cornerPoint = { row: card1.rowIndex, col: card2.colIndex };
    
    // 修改：拐角点必须是已匹配的卡片或者是两张卡片之一
    if (
      cornerPoint.row >= 0 && 
      cornerPoint.row < rows && 
      cornerPoint.col >= 0 && 
      cornerPoint.col < cols && 
      (board[cornerPoint.row][cornerPoint.col].matched || 
       isOneOfCards(cornerPoint.row, cornerPoint.col, card1, card2))
    ) {
      // 检查card1到拐角点的直线路径
      const path1 = checkDirectLine(board, card1, board[cornerPoint.row][cornerPoint.col]);
      
      // 检查拐角点到card2的直线路径
      const path2 = checkDirectLine(board, board[cornerPoint.row][cornerPoint.col], card2);
      
      if (path1.length > 0 && path2.length > 0) {
        return [
          { row: card1.rowIndex, col: card1.colIndex },
          { row: cornerPoint.row, col: cornerPoint.col },
          { row: card2.rowIndex, col: card2.colIndex }
        ];
      }
    }
    
    // 尝试另一个拐角点
    const anotherCornerPoint = { row: card2.rowIndex, col: card1.colIndex };
    
    // 修改：拐角点必须是已匹配的卡片或者是两张卡片之一
    if (
      anotherCornerPoint.row >= 0 && 
      anotherCornerPoint.row < rows && 
      anotherCornerPoint.col >= 0 && 
      anotherCornerPoint.col < cols && 
      (board[anotherCornerPoint.row][anotherCornerPoint.col].matched || 
       isOneOfCards(anotherCornerPoint.row, anotherCornerPoint.col, card1, card2))
    ) {
      // 检查card1到拐角点的直线路径
      const path1 = checkDirectLine(board, card1, board[anotherCornerPoint.row][anotherCornerPoint.col]);
      
      // 检查拐角点到card2的直线路径
      const path2 = checkDirectLine(board, board[anotherCornerPoint.row][anotherCornerPoint.col], card2);
      
      if (path1.length > 0 && path2.length > 0) {
        return [
          { row: card1.rowIndex, col: card1.colIndex },
          { row: anotherCornerPoint.row, col: anotherCornerPoint.col },
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
      // 避开卡片自身的列
      if (col === card1.colIndex || col === card2.colIndex) continue;
      
      const corner1 = { row: card1.rowIndex, col: col };
      const corner2 = { row: card2.rowIndex, col: col };
      
      // 修改：拐角点必须是已匹配的卡片或者是两张卡片之一
      if (
        (board[corner1.row][corner1.col].matched || isOneOfCards(corner1.row, corner1.col, card1, card2)) && 
        (board[corner2.row][corner2.col].matched || isOneOfCards(corner2.row, corner2.col, card1, card2))
      ) {
        // 检查card1到corner1的直线路径
        const path1 = checkDirectLine(board, card1, board[corner1.row][corner1.col]);
        
        // 检查corner1到corner2的直线路径
        const path2 = checkDirectLine(board, board[corner1.row][corner1.col], board[corner2.row][corner2.col]);
        
        // 检查corner2到card2的直线路径
        const path3 = checkDirectLine(board, board[corner2.row][corner2.col], card2);
        
        if (path1.length > 0 && path2.length > 0 && path3.length > 0) {
          return [
            { row: card1.rowIndex, col: card1.colIndex },
            { row: corner1.row, col: corner1.col },
            { row: corner2.row, col: corner2.col },
            { row: card2.rowIndex, col: card2.colIndex }
          ];
        }
      }
    }
    
    // 垂直方向扫描
    for (let row = 0; row < rows; row++) {
      // 避开卡片自身的行
      if (row === card1.rowIndex || row === card2.rowIndex) continue;
      
      const corner1 = { row: row, col: card1.colIndex };
      const corner2 = { row: row, col: card2.colIndex };
      
      // 修改：拐角点必须是已匹配的卡片或者是两张卡片之一
      if (
        (board[corner1.row][corner1.col].matched || isOneOfCards(corner1.row, corner1.col, card1, card2)) && 
        (board[corner2.row][corner2.col].matched || isOneOfCards(corner2.row, corner2.col, card1, card2))
      ) {
        // 检查card1到corner1的直线路径
        const path1 = checkDirectLine(board, card1, board[corner1.row][corner1.col]);
        
        // 检查corner1到corner2的直线路径
        const path2 = checkDirectLine(board, board[corner1.row][corner1.col], board[corner2.row][corner2.col]);
        
        // 检查corner2到card2的直线路径
        const path3 = checkDirectLine(board, board[corner2.row][corner2.col], card2);
        
        if (path1.length > 0 && path2.length > 0 && path3.length > 0) {
          return [
            { row: card1.rowIndex, col: card1.colIndex },
            { row: corner1.row, col: corner1.col },
            { row: corner2.row, col: corner2.col },
            { row: card2.rowIndex, col: card2.colIndex }
          ];
        }
      }
    }
    
    return []; // 无法通过两次拐角连接
  }