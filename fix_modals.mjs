import fs from 'fs';

let content = fs.readFileSync('src/pages/student/DocumentView.jsx', 'utf8');

if (!content.includes("createPortal")) {
  content = content.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';");
}

// 1. empty state modal
content = content.replace(
  "{showCreateModal && (\n          <div className=\"fixed inset-0 z-50 flex items-center justify-center",
  "{showCreateModal && createPortal(\n          <div className=\"fixed inset-0 z-[9999] flex items-center justify-center"
);

// close empty state modal
content = content.replace(
  "              </form>\n            </div>\n          </div>\n        )}",
  "              </form>\n            </div>\n          </div>, document.body\n        )}"
);

// 2. Main layout modal
content = content.replace(
  "{showCreateModal && thesesList.length > 0 && (\n        <div className=\"fixed inset-0 z-[9999] flex items-center justify-center",
  "{showCreateModal && thesesList.length > 0 && createPortal(\n        <div className=\"fixed inset-0 z-[9999] flex items-center justify-center"
);

// close main layout modal
content = content.replace(
  "              </form>\n          </div>\n        </div>\n      )}",
  "              </form>\n          </div>\n        </div>, document.body\n      )}"
);

fs.writeFileSync('src/pages/student/DocumentView.jsx', content);

