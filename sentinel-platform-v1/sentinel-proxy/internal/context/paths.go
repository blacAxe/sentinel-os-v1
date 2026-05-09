package context

import "strings"

func IsExcludedPath(path string) bool {

	if path == "/favicon.ico" {
		return true
	}

	if strings.Contains(path, ".well-known") {
		return true
	}

	return false
}
