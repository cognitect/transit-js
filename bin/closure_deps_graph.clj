(ns closure-deps-graph
  (:require [clojure.java.io :as io])
  (:import [java.io File]
           [com.google.javascript.jscomp SourceFile BasicErrorManager]
           [com.google.javascript.jscomp.deps BrowserModuleResolver
            DepsGenerator DepsGenerator$InclusionStrategy ModuleLoader
            ModuleLoader$PathResolver]))

(defn js-files-in
  "Return a sequence of all .js files in the given directory."
  [dir]
  (filter
    #(let [name (.getName ^File %)]
       (and (.endsWith name ".js")
            (not= \. (first name))))
    (file-seq dir)))

(spit (io/file "deps/closure-library/closure/goog/transit_deps.js")
  (.computeDependencyCalls
    (DepsGenerator.
      []
      (map #(SourceFile/fromFile (.getAbsolutePath %))
        (mapcat (comp js-files-in io/file)
          ["src" "deps/closure-library/closure/goog"]))
      DepsGenerator$InclusionStrategy/ALWAYS
      (.getAbsolutePath (io/file "deps/closure-library/closure/goog"))
      (proxy [BasicErrorManager] []
        (report [level error]
          (println error))
        (println [level error]
          (println error)))
      (ModuleLoader. nil [] []
        BrowserModuleResolver/FACTORY
        ModuleLoader$PathResolver/ABSOLUTE))))
