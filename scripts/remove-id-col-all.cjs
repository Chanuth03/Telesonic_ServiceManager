const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

// Hide #ID column for all screens (MST-01 to MST-33)
const thOld = `{meta.code !== "MST-02" && meta.id !== "O1-SCR-MST-02" && meta.code !== "MST-03" && meta.id !== "O1-SCR-MST-03" && meta.code !== "MST-04" && meta.id !== "O1-SCR-MST-04" && meta.code !== "MST-05" && meta.id !== "O1-SCR-MST-05" && meta.code !== "MST-06" && meta.id !== "O1-SCR-MST-06" && meta.code !== "MST-07" && meta.id !== "O1-SCR-MST-07" && (
                      <th className="py-2.5 px-3 text-center whitespace-nowrap font-mono w-14">ID</th>
                    )}`;

const tdOld = `{meta.code !== "MST-02" && meta.id !== "O1-SCR-MST-02" && meta.code !== "MST-03" && meta.id !== "O1-SCR-MST-03" && meta.code !== "MST-04" && meta.id !== "O1-SCR-MST-04" && meta.code !== "MST-05" && meta.id !== "O1-SCR-MST-05" && meta.code !== "MST-06" && meta.id !== "O1-SCR-MST-06" && meta.code !== "MST-07" && meta.id !== "O1-SCR-MST-07" && (
                          <td className="py-3 px-3 text-center font-mono font-bold text-xs text-muted-foreground whitespace-nowrap">
                            #{displayId}
                          </td>
                        )}`;

code = code.replace(thOld, '');
code = code.replace(tdOld, '');

fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Cleaned up #ID column across all master screens');

