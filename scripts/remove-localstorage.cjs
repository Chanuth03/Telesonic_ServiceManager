const fs = require('fs');
let code = fs.readFileSync('src/components/masters/MasterScreenView.tsx', 'utf8');

// Replace localStorage initialization with pure state, so it never caches stale deleted records
const oldInit = `  // Saved records storage (persisted per screen in localStorage)
  const storageKey = \`telesonic_mst_\${meta.id}\`;
  const [savedRecords, setSavedRecords] = useState<Record<string, unknown>[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    // Pre-seed with the authentic sample record so there is data to search and explore
    return meta.sampleRecord ? [meta.sampleRecord] : [];
  });

  // Search query for saved records
  const [savedSearchQuery, setSavedSearchQuery] = useState("");

  // Sync saved records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedRecords));
    } catch (e) {
      console.error("Failed to persist master records to localStorage", e);
    }
  }, [savedRecords, storageKey]);`;

const newInit = `  // Saved records storage - always authoritative from PostgreSQL backend
  const [savedRecords, setSavedRecords] = useState<Record<string, unknown>[]>([]);

  // Search query for saved records
  const [savedSearchQuery, setSavedSearchQuery] = useState("");`;

code = code.replace(oldInit, newInit);
fs.writeFileSync('src/components/masters/MasterScreenView.tsx', code, 'utf8');
console.log('Removed localStorage cache from MasterScreenView!');

